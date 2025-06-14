import { useForm, SubmitHandler, Controller } from "react-hook-form";
import {
  Form,
  Input,
  Select,
  SelectItem,
  Textarea,
  Button,
} from "@heroui/react";

import Rating from "./Rating";

import { FeedbackFormData } from "@/types";
import { FeedbackFormProps } from "@/types";
import GeneralModal from "@/components/common/Modals/Modal";
import { useApi } from "@/services/useApi";
import { FeedbackCategory } from "@/types/models/feedback";

export default function FeedbackFormModal({
  modalRef,
  submitted,
  setSubmitted,
}: FeedbackFormProps) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm<FeedbackFormData>();

  const api = useApi();

  const {
    mutate: createFeedback,
    isPending,
    isError,
    error,
  } = api.feedback.useCreate({
    onSuccess: (data) => {
      console.log("Feedback sent:", data);
      setSubmitted(true);
      reset();
    },
    onError: (error) => {
      console.error("Failed to create feedback:", error);
    },
  });

  const onSubmit: SubmitHandler<FeedbackFormData> = async (data) => {
    createFeedback({
      ...data,
      category: data.category.toUpperCase() as FeedbackCategory,
      createdAt: new Date().toISOString(),
      isResolved: false,
    });
  };

  return (
    <GeneralModal ref={modalRef} title="Lämna feedback">
      {(data) => {
        if (isPending) {
          return (
            <div className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-2">Skickar...</h2>
              <p className="text-gray-600">Vänligen vänta ett ögonblick.</p>
            </div>
          );
        }
        if (submitted) {
          return (
            <div className="p-6 text-center">
              <h2 className="text-xl font-semibold mb-2">
                Tack för din feedback!
              </h2>
              <p className="text-gray-600">
                Vi uppskattar att du tog dig tid att skriva till oss.
              </p>
              <Button
                className="mt-4 bg-branding2"
                onPress={() => setSubmitted(false)}
              >
                Skicka mer feedback
              </Button>
            </div>
          );
        }

        return (
          <Form
            className="flex items-center sm:items-start mb-4"
            onSubmit={handleSubmit(onSubmit)}
          >
            <Controller
              name="rating"
              control={control}
              rules={{ required: "Betyg krävs" }}
              render={({ field }) => (
                <>
                  <Rating value={field.value} onChange={field.onChange} />
                  {errors.rating && (
                    <p className="text-rose-600">{errors.rating.message}</p>
                  )}
                </>
              )}
            />

            <div className="flex flex-col sm:flex-row gap-4 mt-3">
              <Input
                className="w-64"
                errorMessage="Please enter a valid email"
                label="Email (frivilligt)"
                labelPlacement="outside"
                placeholder="Enter your email"
                type="email"
                {...register("email")}
              />

              <Select
                isRequired
                className="w-64"
                label="Kategori"
                labelPlacement="outside"
                placeholder="Select a category"
                {...register("category")}
              >
                <SelectItem key="bug">Bugg</SelectItem>
                <SelectItem key="suggestion">Förslag</SelectItem>
                <SelectItem key="other">Övrigt</SelectItem>
              </Select>
            </div>

            <Textarea
              isRequired
              className="w-64 sm:w-full"
              label="Meddelande"
              labelPlacement="outside"
              placeholder="Enter your message"
              {...register("message")}
            />

            {isError && (
              <p className="text-rose-600 text-sm">
                Kunde inte skicka feedback: {error.message || "Något gick fel"}
              </p>
            )}

            <div className="flex flex-col sm:flex-row w-full justify-end items-center mt-6 gap-4">
              {/* <div className="flex flex-col sm:flex-row w-full justify-between items-center mt-6 gap-4"> */}
              {/* <Checkbox color="warning">Gör mig anonym</Checkbox> */}
              <Button className="bg-branding2" type="submit">
                Skicka feedback
              </Button>
            </div>
          </Form>
        );
      }}
    </GeneralModal>
  );
}
