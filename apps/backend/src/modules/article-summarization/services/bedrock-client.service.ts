import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ENV_KEYS } from '../../config/env.keys';

interface ClaudeTextResponse {
  content?: Array<{
    type?: string;
    text?: string;
  }>;
}

@Injectable()
export class BedrockClientService {
  private readonly logger = new Logger(BedrockClientService.name);
  private readonly client: BedrockRuntimeClient | null;
  private readonly modelId: string | null;
  private isAvailable = true;

  constructor(private readonly configService: ConfigService) {
    const region = this.getOptionalConfig(ENV_KEYS.AWS_REGION);
    this.modelId = this.getOptionalConfig(ENV_KEYS.BEDROCK_MODEL_ID);
    const accessKeyId = this.getOptionalConfig(
      ENV_KEYS.AWS_ACCESS_KEY_ID,
    );
    const secretAccessKey = this.getOptionalConfig(
      ENV_KEYS.AWS_SECRET_ACCESS_KEY,
    );

    if (!region || !this.modelId) {
      this.client = null;
      this.logger.warn(
        'Bedrock summarization is disabled: AWS_REGION and BEDROCK_MODEL_ID must be configured.',
      );

      return;
    }

    if ((accessKeyId && !secretAccessKey) || (!accessKeyId && secretAccessKey)) {
      this.logger.warn(
        'Bedrock credentials are incomplete: both AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are required when using static credentials.',
      );
    }

    this.client = new BedrockRuntimeClient({
      region,
      maxAttempts: 3,
      ...(accessKeyId && secretAccessKey
        ? {
            credentials: {
              accessKeyId,
              secretAccessKey,
            },
          }
        : {}),
    });
  }

  isConfigured(): boolean {
    return this.client !== null && this.modelId !== null && this.isAvailable;
  }

  async invokeClaudeHaiku(prompt: string): Promise<string> {
    if (!this.client || !this.modelId || !this.isAvailable) {
      throw new Error(
        'Bedrock summarization is not configured or unavailable. Set AWS_REGION and BEDROCK_MODEL_ID and ensure credentials are valid.',
      );
    }

    try {
      const command = new InvokeModelCommand({
        modelId: this.modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify({
          anthropic_version: 'bedrock-2023-05-31',
          max_tokens: 220,
          temperature: 0.2,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: prompt,
                },
              ],
            },
          ],
        }),
      });

      const response = await this.client.send(command);
      const responseBody = new TextDecoder().decode(response.body);
      const parsedResponse = JSON.parse(
        responseBody,
      ) as ClaudeTextResponse;
      const summary = parsedResponse.content
        ?.find((contentItem) => contentItem.type === 'text')
        ?.text?.trim();

      if (!summary) {
        throw new Error('Bedrock returned an empty summary');
      }

      return summary;
    } catch (error) {
      const errorMsg = this.formatError(error);
      const isCredsError =
        errorMsg.includes('Could not load credentials') ||
        (error && (error as any).name === 'CredentialsProviderError');

      if (isCredsError) {
        this.isAvailable = false;
        this.logger.error(
          `Bedrock client disabled: Credentials loading failed. Bedrock calls will be skipped. Error: ${errorMsg}`,
        );
      } else {
        this.logger.error(
          `Bedrock invocation failed: ${errorMsg}`,
          error instanceof Error ? error.stack : undefined,
        );
      }

      throw error;
    }
  }

  private getOptionalConfig(key: string): string | null {
    const value = this.configService.get<string>(key);

    return value?.trim() || null;
  }

  private formatError(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    }

    return 'Unknown error';
  }
}
