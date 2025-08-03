export interface Report {
  _id: string;
  name: string;
  email: string;
  phone: string;
  type: "phishing" | "ponzi" | "loan" | "generic";
  latitude: number;
  longitude: number;
  description: string;
}
