import { useState } from "react";

interface DeleteConfirmProps {
  closeCB: () => void;
  deleteCB: () => void;
}

const DeleteConfirm = ({ closeCB, deleteCB }: DeleteConfirmProps ) => {
  return (
    <div className="flex w-[100px] space-x-1 text-xxxs">
      <div
        className="flex items-center outline outline-1 outline-grey3 rounded cursor-pointer px-1 hover:bg-grey01 uppercase"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          closeCB();
          deleteCB();
        }}
      >
        confirm
      </div>
      <div
        className="flex items-center outline outline-1 outline-grey3 rounded cursor-pointer px-1 hover:bg-grey01 uppercase"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          closeCB();
        }}
      >
        cancel
      </div>
    </div>
  )
}

export default DeleteConfirm;
