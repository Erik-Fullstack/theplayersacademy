export interface IBox {
  title: string;
  description?: string;
}

export interface IFormInput {
  name: string;
  email: string;
  förening: string;
  phone: number;
  message: string;
}

export interface IRegisterFormInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: number;
  association: string;
  seats: number;
}
