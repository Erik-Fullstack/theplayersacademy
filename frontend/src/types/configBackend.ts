export interface IConfigBackendSection {
  id: string;
  title: string;
  text: string;
}

interface IConfigBackendData {
  id: string;
  url?: string;
  isIterable: boolean;
  sections: IConfigBackendSection[];
}

export interface IConfigBackend {
  [key: string]: IConfigBackendData;
}
