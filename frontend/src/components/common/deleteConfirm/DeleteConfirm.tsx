import { useState } from "react";

interface DeleteConfirmProps {
  closeCB: (n: number) => void;
  deleteCB: () => void;
}

const DeleteConfirm = ({ closeCB, deleteCB }: DeleteConfirmProps ) => {
  return (
    <div className="flex w-[100px] space-x-1 text-xxxs">
      <div
        className="outline outline-1 outline-grey3 rounded cursor-pointer px-1 hover:bg-grey01 uppercase"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          closeCB(-1);
          deleteCB();
        }}
      >
        confirm
      </div>
      <div
        className="outline outline-1 outline-grey3 rounded cursor-pointer px-1 hover:bg-grey01 uppercase"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          closeCB(-1);
        }}
      >
        cancel
      </div>
    </div>
  )
}

export default DeleteConfirm;
