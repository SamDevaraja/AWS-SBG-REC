export interface CertificationListItem {
  id: string;
  title: string;
  slug: string;
  examCode: string;
  badgeImageUrl: string | null;
  level: string;
  displayOrder: number;
  examDuration?: string;
  totalQuestions?: number;
  examCost?: number;
  examMode?: string;
  domains?: DomainDetailListItem[];
}

export interface DomainListItem {
  id: string;
  name: string;
  weightage: number;
  displayOrder: number;
}

export interface TopicListItem {
  id: string;
  name: string;
  displayOrder: number;
}

export interface DomainDetailListItem extends DomainListItem {
  topics: TopicListItem[];
}

export interface CertificationDetail {
  id: string;
  title: string;
  slug: string;
  examCode: string;
  examDuration: string;
  totalQuestions: number;
  examCost: number;
  examMode: string;
  badgeImageUrl: string | null;
  displayOrder: number;
  level: {
    id: string;
    name: string;
  };
  domains: DomainDetailListItem[];
}
