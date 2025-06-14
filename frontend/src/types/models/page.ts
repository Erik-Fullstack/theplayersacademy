export interface IPage {
  id: string;
  name?: string;
  url?: string;
  isIterable: boolean;
  sections: ISection[];
}

export interface ISection {
  id: string;
  title: string;
  text: string;
}
