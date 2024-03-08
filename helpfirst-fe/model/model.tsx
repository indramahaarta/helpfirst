export interface ReportResponse {
  id: string;
  uid: string;
  title: string;
  type: string;
  level: string;
  address: string;
  lat: number;
  lng: number;
  user: UserResponse;
}

export interface UserResponse {
  name: string;
  email: string;
  uid: string;
}
