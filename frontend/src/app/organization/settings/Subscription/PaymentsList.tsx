import { useState, useMemo } from "react";
import {
  Button,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Pagination,
} from "@heroui/react";

export const payments = [
  {
    key: "1",
    date: "25-04-18",
    description: "Månadsabonnemang",
    sum: "50.000",
    status: "Betalad",
    invoice: "Visa faktura",
  },
  {
    key: "2",
    date: "25-03-18",
    description: "Månadsabonnemang",
    sum: "30.000",
    status: "Misslyckad",
    invoice: "Visa faktura",
  },
  {
    key: "3",
    date: "25-04-18",
    description: "Månadsabonnemang",
    sum: "50.000",
    status: "Betalad",
    invoice: "Visa faktura",
  },
  {
    key: "4",
    date: "25-02-18",
    description: "Månadsabonnemang",
    sum: "50.000",
    status: "Betalad",
    invoice: "Visa faktura",
  },
  {
    key: "5",
    date: "25-01-18",
    description: "Månadsabonnemang",
    sum: "50.000",
    status: "Betalad",
    invoice: "Visa faktura",
  },
  {
    key: "6",
    date: "24-12-18",
    description: "Månadsabonnemang",
    sum: "100.000",
    status: "Misslyckad",
    invoice: "Visa faktura",
  },
];

export default function PaymentsList() {
  const [page, setPage] = useState(1);
  const rowsPerPage = 4;

  const pages = Math.ceil(payments.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return payments.slice(start, end);
  }, [page, payments]);

  return (
    <div className="flex-col gap-4 hidden md:flex">
      <Table aria-label="Example table with client side pagination">
        <TableHeader>
          <TableColumn className="bg-white border-b-2">Datum</TableColumn>
          <TableColumn className="bg-white border-b-2">Beskrivning</TableColumn>
          <TableColumn className="bg-white border-b-2">Summa</TableColumn>
          <TableColumn className="bg-white border-b-2">Status</TableColumn>
          <TableColumn className="bg-white border-b-2">Fakturor</TableColumn>
        </TableHeader>
        <TableBody items={items}>
          {(item) => (
            <TableRow key={item.key}>
              <TableCell>{item.date}</TableCell>
              <TableCell>{item.description}</TableCell>
              <TableCell>{item.sum}</TableCell>
              <TableCell>
                <Chip
                  className="capitalize border-none p-0"
                  color={item.status === "Betalad" ? "success" : "danger"}
                  size="md"
                  variant="dot"
                >
                  {item.status}
                </Chip>
              </TableCell>
              <TableCell>
                <Button className="bg-yellow-400 font-semibold rounded-small h-9">
                  {item.invoice}
                </Button>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="flex w-full p-2">
        <Pagination
          // isCompact
          showControls
          showShadow
          color="warning"
          page={page}
          total={pages}
          onChange={(page) => setPage(page)}
        />
      </div>
    </div>
  );
}
