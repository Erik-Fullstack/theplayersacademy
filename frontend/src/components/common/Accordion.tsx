import { Accordion as HeroAccordion, AccordionItem } from "@heroui/react";

interface AccordionItemData {
  id: string;
  title: string;
  text: string;
  ariaLabel?: string;
}

interface AccordionIndexProps {
  items?: AccordionItemData[];
}

export default function Accordion({ items }: AccordionIndexProps) {
  // Default content if no items provided
  const defaultItems: AccordionItemData[] = [
    {
      id: "1",
      title: "Accordion 1",
      text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      ariaLabel: "Accordion 1",
    },
    {
      id: "2",
      title: "Accordion 2",
      text: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
      ariaLabel: "Accordion 2",
    },
    {
      id: "3",
      title: "Accordion 3",
      text: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
      ariaLabel: "Accordion 3",
    },
    {
      id: "4",
      title: "Accordion 4",
      text: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
      ariaLabel: "Accordion 4",
    },
    {
      id: "5",
      title: "Accordion 5",
      text: "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
      ariaLabel: "Accordion 5",
    },
  ];
  const itemsExists = items || defaultItems;

  return (
    <HeroAccordion variant="splitted">
      {itemsExists &&
        itemsExists.map((item) => (
          <AccordionItem
            key={item.id}
            title={item.title}
            classNames={{
              content: "text-medium pb-4 ",
              title: "text-lg text-branding3",
              indicator: "text-branding3 text-2xl sm:text-4xl",
            }}
            className="mb-3"
          >
            {item.text}
          </AccordionItem>
        ))}
    </HeroAccordion>
  );
}
