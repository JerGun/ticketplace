import React from "react";

function ListTicket() {
  return (
    <div className="h-fit w-full p-10 bg-background">
      <div className="h-full mx-28 text-white">
        <p className="text-4xl font-bold py-5">Create new ticket</p>
        <div className="h-full w-full flex space-x-20">
          <div className="h-full w-3/12">
            <p>Image</p>
            <p className="text-sm text-sub-text">
              File types supported: JPG, PNG
            </p>
            <div className="h-96 w-10/12 mt-3 p-1 rounded-2xl border-dashed border-2">
              <div className="relative h-full w-full">
                <label
                  htmlFor="upload-button"
                  className="absolute h-full w-full hover:cursor-pointer"
                >
                  {/* {image.preview ? (
                    <div className="relative h-full w-full">
                      <div className="absolute h-full w-full z-20 flex justify-center items-center opacity-0 hover:bg-black hover:bg-opacity-50 hover:opacity-100">
                        <Photo />
                      </div>
                      <img
                        src={image.preview}
                        alt="dummy"
                        className="h-full w-full object-cover rounded-xl"
                      />
                    </div>
                  ) : (
                    <div className="absolute h-full w-full z-10 flex justify-center items-center rounded-xl hover:bg-black hover:bg-opacity-50">
                      <Photo />
                    </div>
                  )} */}
                </label>
                <input
                  type="file"
                  id="upload-button"
                  className="hidden"
                //   onChange={handleImageChange}
                />
              </div>
            </div>
          </div>
          <div className="w-1/2 space-y-10">
            <div className="space-y-3">
              <p>Ticket name</p>
              <div className="h-11 px-3 rounded-lg bg-input hover:bg-hover focus-within:bg-hover">
                <input
                  type="text"
                  placeholder="Ticket name"
                  className="h-full w-full bg-transparent"
                //   onChange={(e) =>
                //     setFormInput({
                //       ...formInput,
                //       name: e.target.value,
                //     })
                //   }
                />
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <p>External Link</p>
                <p className="text-sm text-sub-text">
                  You are welcome to link to your own webpage with more details.
                </p>
              </div>
              <div className="h-11 px-3 rounded-lg bg-input hover:bg-hover focus-within:bg-hover">
                <input
                  type="text"
                  placeholder="https://yoursite.com/ticket/details"
                  className="h-full w-full bg-transparent"
                //   onChange={(e) =>
                //     setFormInput({
                //       ...formInput,
                //       link: e.target.value,
                //     })
                //   }
                />
              </div>
            </div>
           

            <button
              type="submit"
            //   onClick={handleSubmit}
              className="h-11 w-24 flex justify-center items-center rounded-lg font-bold text-black bg-primary"
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ListTicket;
