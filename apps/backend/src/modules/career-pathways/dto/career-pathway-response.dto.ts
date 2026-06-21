export interface CareerPathwayListItem {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface CareerPathwayDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  pathway: {
    pathOrder: number;
    certification: {
      id: string;
      title: string;
      slug: string;
      examCode: string;
      badgeImageUrl: string | null;
      level: {
        id: string;
        name: string;
      };
    };
  }[];
  opportunities: {
    id: string;
    title: string;
    displayOrder: number;
  }[];
}
