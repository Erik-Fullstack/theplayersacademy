import { useMemo, useState } from "react";
import { Button, Chip, Card, CardBody, Pagination } from "@heroui/react";

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

export default function PaymentsListMobile() {
  const [page, setPage] = useState(1);
  const rowsPerPage = 3;

  const pages = Math.ceil(payments.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return payments.slice(start, end);
  }, [page, payments]);

  return (
    <div className="flex flex-col gap-4 md:hidden">
      <Card className="flex p-2">
        {items.map((payment) => (
          <CardBody
            key={payment.key}
            className="flex flex-col justify-between gap-4 border-b-2"
          >
            <div className="flex flex-row justify-between">
              <div>
                <p className="font-semibold text-xl">{payment.sum}:-</p>
                <p>{payment.description}</p>
              </div>
              <Chip
                className="capitalize border-none p-0"
                color={payment.status === "Betalad" ? "success" : "danger"}
                size="md"
                variant="dot"
              >
                {payment.status}
              </Chip>
            </div>
            <div className="flex flex-row justify-between">
              <div>
                <p className="font-semibold">Datum utfärdat</p>
                <p>{payment.date}</p>
              </div>
              <Button className="bg-yellow-400 font-semibold rounded-small h-9">
                {payment.invoice}
              </Button>
            </div>
          </CardBody>
        ))}
        {/* <div className="flex w-full justify-center mt-4">
          <Pagination
            isCompact
            showControls
            showShadow
            color="success"
            page={page}
            total={pages}
            onChange={(page) => setPage(page)}
          />
        </div> */}
      </Card>
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
