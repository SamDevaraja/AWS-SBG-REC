export interface CareerRoleListItem {
  id: string;
  name: string;
  slug: string;
  description: string;
}

export interface CareerRoleDetail {
  id: string;
  name: string;
  slug: string;
  description: string;
  certifications: {
    pathOrder: number;
    certification: {
      id: string;
      title: string;
      slug: string;
      examCode: string;
      level: { id: string; name: string };
    };
  }[];
  opportunities: {
    id: string;
    title: string;
    displayOrder: number;
  }[];
}
