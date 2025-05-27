export interface AuthJwtPayload {
  sub: number;       
  email: string;     
  role: string;    
  tenantId: number; 
}