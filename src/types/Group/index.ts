export type GroupMemberRole = "owner" | "admin" | "member";

export type GroupMember = {
  id: number;
  firstname: string;
  lastname: string;
  pseudo: string;
  GroupMember: {
    role: GroupMemberRole;
    joined_at: string;
  };
};

export type Group = {
  id: number;
  name: string;
  description?: string | null;
  cover_img_url?: string | null;
  is_public: boolean;
  createdAt: string;
  updatedAt: string;
  members: GroupMember[];
};

export type GroupMessageSender = {
  id: number;
  firstname: string;
  lastname: string;
  pseudo: string;
};

export type GroupMessage = {
  id: number;
  group_id: number;
  sender_id: number;
  content: string;
  type: string;
  is_deleted: boolean;
  edited_at: string | null;
  send_at: string;
  createdAt: string;
  sender: GroupMessageSender;
  replyTo: GroupMessage | null;
};
