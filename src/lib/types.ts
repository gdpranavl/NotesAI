export interface Note {
    id: string;
    user_id: string;
    title: string;
    content: string;
    summary: string | null;
    created_at: string;
    updated_at: string;
  }
  
  export type SignInCredentials = {
    email: string;
    password: string;
  };
  
  export type SignUpCredentials = SignInCredentials & {
    passwordConfirm: string;
  };
  