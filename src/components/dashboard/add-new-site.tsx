"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useCreateNewSite } from "@/store";
import { Plus } from "lucide-react";
import { Button } from "../ui/button";
import AddWebsite from "./add-website";

const AddNewSite = () => {
  const { isOpen, onOpen } = useCreateNewSite();
  return (
    <Dialog open={isOpen} onOpenChange={onOpen}>
      <DialogTrigger asChild>
        <Button
          variant="default"
          className="dark:bg-blue-700 dark:hover:bg-blue-600 dark:text-white"
        >
          <Plus className="h-4 w-4" />
          Add Website
        </Button>
      </DialogTrigger>

      <DialogContent className="bg-white p-4 max-w-lg sm:max-w-xl mx-auto dark:bg-zinc-900">
        <DialogTitle className="sr-only">Add a new website</DialogTitle>
        <AddWebsite />
      </DialogContent>
    </Dialog>
  );
};

export default AddNewSite;
