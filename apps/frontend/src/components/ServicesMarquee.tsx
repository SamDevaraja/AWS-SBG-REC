"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const BASE = "https://raw.githubusercontent.com/SamDevaraja/AWS-SBG-REC/cbf1e2065c9a67ce4e1da4ffb83bf5a143780d74/apps/backend/uploads/services";

const Icons: Record<string, string> = {
  ec2:        `${BASE}/amazon-ec2.svg`,
  s3:         `${BASE}/amazon-s3.svg`,
  lambda:     `${BASE}/aws-lambda.svg`,
  rds:        `${BASE}/amazon-rds.svg`,
  dynamodb:   `${BASE}/amazon-dynamodb.svg`,
  sagemaker:  `${BASE}/amazon-sagemaker.svg`,
  cloudwatch: `${BASE}/amazon-cloudwatch.svg`,
  cognito:    `${BASE}/amazon-cognito.svg`,
};

const AWS_SERVICES = [
  { id: "ec2",        name: "Amazon EC2",        tag: "Compute",      color: "#FF9900", desc: "Secure, resizable compute capacity in the cloud. Boot virtual servers, configure networking, and manage storage — all on-demand." },
  { id: "s3",         name: "Amazon S3",          tag: "Storage",      color: "#3F8CFF", desc: "Object storage built to retrieve any amount of data from anywhere. Ideal for static hosting, user uploads, and secure backups." },
  { id: "lambda",     name: "AWS Lambda",         tag: "Serverless",   color: "#E05252", desc: "Run code without provisioning servers. Pay only for compute time consumed — perfect for microservices and event-driven apps." },
  { id: "rds",        name: "Amazon RDS",         tag: "Database",     color: "#2EAD7F", desc: "Managed relational databases in the cloud. Supports MySQL, PostgreSQL, and Oracle with automated backups and scaling." },
  { id: "dynamodb",   name: "Amazon DynamoDB",   tag: "NoSQL",        color: "#8C52FF", desc: "Fully managed, serverless NoSQL key-value database. Single-digit millisecond latency at any scale." },
  { id: "sagemaker",  name: "Amazon SageMaker",  tag: "ML",           color: "#00A3BF", desc: "Build, train, and deploy machine learning models at scale with fully managed infrastructure and MLOps tooling." },
  { id: "cloudwatch", name: "Amazon CloudWatch", tag: "Monitoring",   color: "#FF6B35", desc: "Observability for AWS resources and applications. Collect metrics, set alarms, and visualise logs in real time." },
  { id: "cognito",    name: "Amazon Cognito",    tag: "Auth",         color: "#DD344C", desc: "Add user sign-up, sign-in, and access control to web and mobile apps quickly and easily with managed identity pools." },
];

export default function ServicesMarquee() {
  const [hoveredService, setHoveredService] = useState<typeof AWS_SERVICES[0] | null>(null);

  return (
    <div style={{ width: "100%", position: "relative", zIndex: 5, overflow: "hidden" }}>
      <style>{`
        @keyframes marquee-slide {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
      `}</style>

      <div
        onMouseLeave={() => setHoveredService(null)}
        style={{
          position: "relative",
          width: "100%",
          background: "#05111f",
          borderTop: "1px solid rgba(255,255,255,0.07)",
          borderBottom: "1px solid rgba(255,255,255,0.07)",
          padding: "14px 0",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          minHeight: "68px",
        }}
      >
        {/* ── Hover info overlay ───────────────────────────────────────── */}
        <AnimatePresence>
          {hoveredService && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              style={{
                position: "absolute",
                inset: 0,
                background: "#05111f",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10,
                borderTop: `1px solid ${hoveredService.color}40`,
                borderBottom: `1px solid ${hoveredService.color}40`,
              }}
            >
              <div
                style={{
                  width: "100%",
                  maxWidth: "860px",
                  padding: "0 32px",
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                }}
              >
                {/* Accent bar */}
                <div
                  style={{
                    width: "3px",
                    height: "36px",
                    borderRadius: "2px",
                    background: hoveredService.color,
                    flexShrink: 0,
                  }}
                />
                {/* Icon */}
                <img
                  src={Icons[hoveredService.id]}
                  alt={hoveredService.name}
                  style={{ width: 28, height: 28, flexShrink: 0, objectFit: "contain" }}
                />
                {/* Text */}
                <div style={{ display: "flex", flexDirection: "column", gap: "3px", flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span
                      style={{
                        fontSize: "14px",
                        fontWeight: 700,
                        color: "#ffffff",
                        letterSpacing: "0.01em",
                      }}
                    >
                      {hoveredService.name}
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 600,
                        color: hoveredService.color,
                        background: `${hoveredService.color}18`,
                        border: `1px solid ${hoveredService.color}40`,
                        padding: "1px 8px",
                        borderRadius: "4px",
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {hoveredService.tag}
                    </span>
                  </div>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "13px",
                      color: "rgba(255,255,255,0.55)",
                      lineHeight: 1.5,
                      fontWeight: 400,
                    }}
                  >
                    {hoveredService.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Scrolling pill track ─────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            width: "max-content",
            animationName: "marquee-slide",
            animationDuration: "34s",
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            animationPlayState: hoveredService ? "paused" : "running",
            gap: "12px",
            paddingLeft: "24px",
            willChange: "transform",
          }}
        >
          {[...AWS_SERVICES, ...AWS_SERVICES].map((service, index) => (
            <motion.div
              key={`${service.id}-${index}`}
              onMouseEnter={() => setHoveredService(service)}
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.15 }}
              style={{
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "8px 18px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: "6px",
                color: "rgba(255,255,255,0.75)",
                fontSize: "13px",
                fontWeight: 500,
                whiteSpace: "nowrap",
                cursor: "default",
                letterSpacing: "0.01em",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                <img
                  src={Icons[service.id]}
                  alt={service.name}
                  style={{ width: 20, height: 20, objectFit: "contain" }}
                />
              </span>
              <span>{service.name}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
