import { Button } from "@heroui/react";

export default function PaymentMethod() {
  return (
    <article className="flex flex-row gap-8 bg-white rounded-medium py-3 px-4 mb-16">
      <div className=" bg-gray-200 h-36 w-5/12" />
      <div className="flex flex-col justify-around">
        <div>
          <h5>Månadsabonnemang</h5>
          <p>
            <span className="font-medium">Nästa betalning:</span> 3 maj 2025
          </p>
        </div>
        <Button className="bg-yellow-400 font-semibold rounded-small h-9">
          Hantera betalningsmetod
        </Button>
      </div>
    </article>
  );
}
