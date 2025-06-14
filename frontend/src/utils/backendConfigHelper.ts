import { IConfigBackendSection } from "@/types/configBackend";
//function to simplify writing code when getting content or title from backend config file
export default function findNameHelper(
  arr: IConfigBackendSection[],
  str: string,
) {
  return arr.find((item: IConfigBackendSection) => item.id === str);
}
