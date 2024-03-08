import { Button } from "@/components/ui/button";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
  Dialog,
} from "@/components/ui/dialog";
import { Formik, Form, FormikHelpers } from "formik";
import * as Yup from "yup";
import { useToast } from "@/components/ui/use-toast";
import axios from "axios";
import { GeoLocation } from "../home";
import { DialogTrigger } from "@radix-ui/react-dialog";
import ReportFormInput from "./report-form-input";
import ReportFormSelect from "./report-form-select";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ReportResponse } from "@/model/model";

interface ReportFormProps {
  location: GeoLocation;
  address: string;
  onClose: () => void;
  onSubmit: Dispatch<SetStateAction<ReportResponse[]>>;
}

interface ReportForm {
  title: string;
  type: string;
  address: string;
  lat: number;
  lng: number;
  level: string;
}

const ReportFormSchema = Yup.object().shape({
  title: Yup.string().required("title is required"),
  type: Yup.string().required("type is required"),
  address: Yup.string().required("address is required"),
  lat: Yup.string().required("latitude is required"),
  lng: Yup.string().required("longgitude is required"),
  level: Yup.string().required("level is required"),
});

const ReportForm = ({
  location,
  address,
  onClose,
  onSubmit,
}: ReportFormProps) => {
  const { toast } = useToast();
  const [initValue, setInitValue] = useState({
    title: "",
    type: "",
    level: "",
    address: address,
    lat: location.lat,
    lng: location.lng,
  });

  useEffect(() => {
    setInitValue((state) => ({
      ...state,
      address: address,
      lat: location.lat,
      lng: location.lng,
    }));
  }, [location, address]);

  const reportFormHandler = async (
    values: ReportForm,
    { setSubmitting }: FormikHelpers<ReportForm>
  ) => {
    setSubmitting(true);
    try {
      const {
        data: { message, report },
      } = await axios.post("/api/report", values);
      onSubmit((state) => [...state, report]);
      toast({
        title: "Success",
        description: message,
      });
      document.getElementById("close-report-form-popup")?.click();
    } catch (error) {
      toast({
        title: "Error",
        description: "there is an error",
        variant: "destructive",
      });
    }
    setSubmitting(false);
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <div className="mt-5 flex flex-col space-y-2 text-center">
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            Form
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            Report or Ask Help to any people!
          </DialogDescription>
        </div>
      </DialogHeader>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="grid gap-6">
          <Formik
            initialValues={initValue}
            onSubmit={reportFormHandler}
            validationSchema={ReportFormSchema}
          >
            {({ isSubmitting, setFieldValue }) => (
              <Form>
                <div className="grid">
                  <div className="grid grid-cols-2 gap-2">
                    <ReportFormInput
                      label="Title"
                      name="title"
                      placeholder="'There's a flood!' or 'Help! There's a fire'"
                    />
                    <ReportFormSelect
                      name="type"
                      label="Type"
                      onValueChange={(val) => setFieldValue("type", val)}
                      items={[
                        { value: "Ask Help", label: "Ask Help" },
                        { value: "Report", label: "Report" },
                      ]}
                    />
                    <ReportFormSelect
                      name="level"
                      label="Level"
                      onValueChange={(val) => setFieldValue("level", val)}
                      items={[
                        { value: "Low", label: "Low" },
                        { value: "Medium", label: "Medium" },
                        { value: "High", label: "High" },
                      ]}
                    />
                    <ReportFormInput
                      label="Address"
                      name="address"
                      placeholder="Full address"
                    />
                    <ReportFormInput
                      label="Latitude"
                      name="lat"
                      placeholder="Latitude"
                      classname="!col-span-1"
                    />
                    <ReportFormInput
                      label="Longitude"
                      name="lng"
                      placeholder="Longitude"
                      classname="!col-span-1"
                    />
                  </div>
                  <Button
                    disabled={isSubmitting}
                    className="disable:cursor-not-allowed inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 mt-8"
                    type="submit"
                  >
                    {isSubmitting ? (
                      <>
                        <div
                          className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
                          role="status"
                        />
                        <span>Loading...</span>
                      </>
                    ) : (
                      "Submit"
                    )}
                  </Button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
      <DialogFooter>
        <div className="w-full px-8 text-center text-sm text-muted-foreground">
          Don&apos;t hesitate to report or ask for help ^^!
        </div>
      </DialogFooter>
      <DialogClose
        id="close-report-form-popup"
        onClick={onClose}
        className="hidden"
      />
    </DialogContent>
  );
};

export default ReportForm;
