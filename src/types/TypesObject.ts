export type ProjectDTO = {
  id: number;
  title: string;
  description: string;
  content: string;
  status: string;
  tags: Array<{
    id: number;
    name: string;
    created_at: string;
    updated_at: string;
  }>;
  createdAt: string;
};

export type NewsDTO={
  id: number;
  title: string;
  description : string;
  newsDate :Date;
  
}

export type EventDTO = {
  id: number;
  title: string;
  description: string;
  event_date: Date;
  images?: Array<{
    image_url?: string;
  }>;
};

export type ResourceDTO = {
  id: number;
  title: string;
  description: string;
  file_url: string;
  material_type: "article" | "didactic_material" | "software";
  created_at: string;
  user?: {
    id?: number;
    name?: string;
    email?: string;
  };
};
