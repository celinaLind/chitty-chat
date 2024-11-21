import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import React, { useRef } from "react";

export function useImageUpload() {
  // fetch upload url from the backend
  const generateUploadUrl = useMutation(
    api.functions.storage.generateUploadUrl
  );

  // initializing state storage id as undefined
  const [storageId, setStorageId] = React.useState<Id<"_storage"> | undefined>(
    undefined
  );
  const [previewUrl, setPreviewUrl] = React.useState<string | undefined>(
    undefined
  );
  const [isUploading, setIsUploading] = React.useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const open = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    // grab image file
    const file = event.target.files?.[0];

    if (!file) return;

    setIsUploading(true); // set isUploading to true
    setPreviewUrl(URL.createObjectURL(file)); // create a preview url for the image

    const url = await generateUploadUrl(); //url we will send the image to
    // send request to url with file as the body and receive a response object
    const res = await fetch(url, {
      method: "POST",
      body: file,
    });

    // there is no check for the type of the response object
    // check the documentation to know response object type
    const data = (await res.json()) as { storageId: Id<"_storage"> }; //parse the response object into json
    setStorageId(data.storageId); // set the storage id to the parsed storage id
    // this allows us to use the storage id in components/pages that use this hook
    setIsUploading(false); // set isUploading to false
  };
  //handle the state storage id and preview url once you are done with the image upload
  const reset = () => {
    setStorageId(undefined);
    setPreviewUrl(undefined);
    // if the inputRef is not null, set the value to an empty string
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return {
    storageId,
    previewUrl,
    isUploading,
    open,
    reset,
    inputProps: {
      type: "file",
      className: "hidden",
      ref: inputRef,
      onChange: handleImageChange,
    },
  };
}
