import { UserRole } from "src/users/user.entity";

export type CurrentUser = {
    id: number; 
    email: string;
    role : UserRole;
    tenantId?: number; 
}