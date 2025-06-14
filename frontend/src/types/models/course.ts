export interface ICourse {
  id: string;
  name: string;
  description: string;
  learnifierId: string;
  gameFormatId?: string;
  playerCount: number;
  trainerCount: number;
  image: string;
  loginLink: string;
}
