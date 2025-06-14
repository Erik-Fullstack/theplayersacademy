import { useForm, SubmitHandler } from "react-hook-form";
import { Form, Input, Button, Textarea } from "@heroui/react";

import { IFormInput } from "@/types";

export default function ContactRequestForm() {
  const { register, handleSubmit, reset } = useForm<IFormInput>();

  const onSubmit: SubmitHandler<IFormInput> = (data) => {
    reset();
  };

  return (
    <Form
      className="gap-4 p-6 border-small border-branding3 bg-white  rounded-medium"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <Input
          isRequired
          errorMessage="Please enter your name"
          label="Namn"
          labelPlacement="outside"
          placeholder="Enter your name"
          type="text"
          {...register("name")}
        />

        <Input
          isRequired
          errorMessage="Please enter a valid email"
          label="Email"
          labelPlacement="outside"
          placeholder="Enter your email"
          type="email"
          {...register("email")}
        />
      </div>
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <Input
          isRequired
          errorMessage="Please enter your association"
          label="Förening"
          labelPlacement="outside"
          placeholder="Enter your association"
          type="text"
          {...register("förening")}
        />
        <Input
          label="Telefonnummer (valfritt)"
          labelPlacement="outside"
          placeholder="Enter your phone number"
          type="tel"
          {...register("phone")}
        />
      </div>

      <Textarea
        disableAnimation
        isRequired
        classNames={{
          base: "w-full",
          input: "resize-y min-h-[100px] ",
          label: "text-left",
        }}
        errorMessage="Please enter a message"
        label="Meddelande"
        labelPlacement="outside"
        placeholder="Enter your message"
        {...register("message")}
      />

      <div className="flex  w-full justify-end">
        <Button className="bg-branding2" type="submit">
          Skicka meddelande
        </Button>
      </div>
    </Form>
  );
}
