import "../styles/CreateListing.scss";
import Navbar from "../components/Navbar";
import { categories, types, facilities } from "../data";

import { RemoveCircleOutline, AddCircleOutline } from "@mui/icons-material";
import variables from "../styles/variables.scss";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { IoIosImages } from "react-icons/io";
import { useState, useEffect } from "react";
import { BiTrash } from "react-icons/bi";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { v4 as uuidv4 } from "uuid";
import { setLogin } from "../redux/state";
import toast from "react-hot-toast";


const CreateListing = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const user = useSelector((state) => state.user);
  const token = useSelector((state) => state.token);

  // Redirect if not logged in
  useEffect(() => {
    if (!user || !user._id) {
      navigate("/login");
    }
  }, [user, navigate]);

  // States
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");

  const [formLocation, setFormLocation] = useState({
    streetAddress: "",
    aptSuite: "",
    city: "",
    province: "",
    country: "",
  });

  const handleChangeLocation = (e) => {
    const { name, value } = e.target;
    setFormLocation({ ...formLocation, [name]: value });
  };

  const [guestCount, setGuestCount] = useState(1);
  const [bedroomCount, setBedroomCount] = useState(1);
  const [bedCount, setBedCount] = useState(1);
  const [bathroomCount, setBathroomCount] = useState(1);

  const [amenities, setAmenities] = useState([]);
  const handleSelectAmenities = (facility) => {
    if (amenities.includes(facility)) {
      setAmenities((prev) => prev.filter((f) => f !== facility));
    } else {
      setAmenities((prev) => [...prev, facility]);
    }
  };

  const [photos, setPhotos] = useState([]);
  const handleUploadPhotos = (e) => {
    const newPhotos = Array.from(e.target.files).map((file) => ({
      id: uuidv4(),
      file,
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  const handleDragPhoto = (result) => {
    if (!result.destination) return;
    const items = Array.from(photos);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setPhotos(items);
  };

  const handleRemovePhoto = (id) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const [formDescription, setFormDescription] = useState({
    title: "",
    description: "",
    highlight: "",
    highlightDesc: "",
    price: 0,
  });

  const handleChangeDescription = (e) => {
    const { name, value } = e.target;
    setFormDescription({ ...formDescription, [name]: value });
  };

  // Submit handler
  const handlePost = async (e) => {
    e.preventDefault();

    if (!user || !user._id || !token) {
      toast.error("You must be logged in to create a listing!");
      navigate("/login");
      return;
    }

    // Validate required fields
    if (
      !category ||
      !type ||
      !formLocation.streetAddress ||
      !formLocation.city ||
      !formLocation.province ||
      !formLocation.country ||
      !formDescription.title ||
      !formDescription.description ||
      !formDescription.highlight ||
      !formDescription.highlightDesc ||
      formDescription.price <= 0
    ) {
      toast.error("Please fill up all information!");
      return;
    }

    try {
      const listingForm = new FormData();
      listingForm.append("category", category);
      listingForm.append("type", type);
      Object.keys(formLocation).forEach((key) =>
        listingForm.append(key, formLocation[key])
      );
      listingForm.append("guestCount", guestCount);
      listingForm.append("bedroomCount", bedroomCount);
      listingForm.append("bedCount", bedCount);
      listingForm.append("bathroomCount", bathroomCount);
      listingForm.append("amenities", JSON.stringify(amenities));
      Object.keys(formDescription).forEach((key) =>
        listingForm.append(key, formDescription[key])
      );
      photos.forEach((photo) => listingForm.append("listingPhotos", photo.file));

      const response = await fetch("http://localhost:3001/properties/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: listingForm,
      });

      if (response.ok) {
        dispatch(
          setLogin({
            user: { ...user, isHost: true },
            token,
          })
        );
        toast.success("Listing created successfully!");
        navigate("/");
      } else {
        const data = await response.json();
        toast.error("Failed to publish listing: " + (data.message || "Server error"));
      }
    } catch (err) {
      console.error("Publish Listing failed", err);
      toast.error("Failed to publish listing: " + err.message);
    }
  };

  return (
    <>
      <Navbar />
      <div className="create-listing">
        <h1>Publish Your Place</h1>
        <form onSubmit={handlePost}>
          {/* --- Step 1 --- */}
          <div className="create-listing_step1">
            <h2>Step 1: Tell us about your place</h2>
            <hr />
            <h3>Which of these categories best describes your place?</h3>
            <div className="category-list">
              {categories
                .filter((item) => item.label !== "All")
                .map((item, index) => (
                  <div
                    className={`category ${category === item.label ? "selected" : ""}`}
                    key={index}
                    onClick={() => setCategory(item.label)}
                  >
                    <div className="category_icon">{item.icon}</div>
                    <p>{item.label}</p>
                  </div>
                ))}
            </div>

            <h3>What type of place will guests have?</h3>
            <div className="type-list">
              {types?.map((item, index) => (
                <div
                  className={`type ${type === item.name ? "selected" : ""}`}
                  key={index}
                  onClick={() => setType(item.name)}
                >
                  <div className="type_text">
                    <h4>{item.name}</h4>
                    <p>{item.description}</p>
                  </div>
                  <div className="type_icon">{item.icon}</div>
                </div>
              ))}
            </div>

            <h3>Where's your place located?</h3>
            <div className="full">
              <div className="location">
                <p>Street Address</p>
                <input
                  type="text"
                  name="streetAddress"
                  value={formLocation.streetAddress}
                  onChange={handleChangeLocation}
                  required
                />
              </div>
            </div>

            <div className="half">
              <div className="location">
                <p>Apartment, Suite, etc.</p>
                <input
                  type="text"
                  name="aptSuite"
                  value={formLocation.aptSuite}
                  onChange={handleChangeLocation}
                />
              </div>
              <div className="location">
                <p>City</p>
                <input
                  type="text"
                  name="city"
                  value={formLocation.city}
                  onChange={handleChangeLocation}
                  required
                />
              </div>
            </div>

            <div className="half">
              <div className="location">
                <p>Province</p>
                <input
                  type="text"
                  name="province"
                  value={formLocation.province}
                  onChange={handleChangeLocation}
                  required
                />
              </div>
              <div className="location">
                <p>Country</p>
                <input
                  type="text"
                  name="country"
                  value={formLocation.country}
                  onChange={handleChangeLocation}
                  required
                />
              </div>
            </div>

            <h3>Share some basics about your place</h3>
            <div className="basics">
              {/* Guests */}
              <div className="basic">
                <p>Guests</p>
                <div className="basic_count">
                  <RemoveCircleOutline
                    onClick={() => guestCount > 1 && setGuestCount(guestCount - 1)}
                    sx={{ fontSize: 25, cursor: "pointer", "&:hover": { color: variables.pinkred } }}
                  />
                  <p>{guestCount}</p>
                  <AddCircleOutline
                    onClick={() => setGuestCount(guestCount + 1)}
                    sx={{ fontSize: 25, cursor: "pointer", "&:hover": { color: variables.pinkred } }}
                  />
                </div>
              </div>

              {/* Bedrooms */}
              <div className="basic">
                <p>Bedrooms</p>
                <div className="basic_count">
                  <RemoveCircleOutline
                    onClick={() => bedroomCount > 1 && setBedroomCount(bedroomCount - 1)}
                    sx={{ fontSize: 25, cursor: "pointer", "&:hover": { color: variables.pinkred } }}
                  />
                  <p>{bedroomCount}</p>
                  <AddCircleOutline
                    onClick={() => setBedroomCount(bedroomCount + 1)}
                    sx={{ fontSize: 25, cursor: "pointer", "&:hover": { color: variables.pinkred } }}
                  />
                </div>
              </div>

              {/* Beds */}
              <div className="basic">
                <p>Beds</p>
                <div className="basic_count">
                  <RemoveCircleOutline
                    onClick={() => bedCount > 1 && setBedCount(bedCount - 1)}
                    sx={{ fontSize: 25, cursor: "pointer", "&:hover": { color: variables.pinkred } }}
                  />
                  <p>{bedCount}</p>
                  <AddCircleOutline
                    onClick={() => setBedCount(bedCount + 1)}
                    sx={{ fontSize: 25, cursor: "pointer", "&:hover": { color: variables.pinkred } }}
                  />
                </div>
              </div>

              {/* Bathrooms */}
              <div className="basic">
                <p>Bathrooms</p>
                <div className="basic_count">
                  <RemoveCircleOutline
                    onClick={() => bathroomCount > 1 && setBathroomCount(bathroomCount - 1)}
                    sx={{ fontSize: 25, cursor: "pointer", "&:hover": { color: variables.pinkred } }}
                  />
                  <p>{bathroomCount}</p>
                  <AddCircleOutline
                    onClick={() => setBathroomCount(bathroomCount + 1)}
                    sx={{ fontSize: 25, cursor: "pointer", "&:hover": { color: variables.pinkred } }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* --- Step 2 --- */}
          <div className="create-listing_step2">
            <h2>Step 2: Make your place stand out</h2>
            <hr />
            <h3>Tell guests what your place has to offer</h3>
            <div className="amenities">
              {facilities.map((item, index) => (
                <div
                  className={`facility ${amenities.includes(item.name) ? "selected" : ""}`}
                  key={index}
                  onClick={() => handleSelectAmenities(item.name)}
                >
                  <div className="facility_icon">{item.icon}</div>
                  <p>{item.name}</p>
                </div>
              ))}
            </div>

            <h3>Add some photos of your place</h3>
            <DragDropContext onDragEnd={handleDragPhoto}>
              <Droppable droppableId="photos" direction="horizontal">
                {(provided) => (
                  <div className="photos" {...provided.droppableProps} ref={provided.innerRef}>
                    {photos.map((photo, index) => (
                      <Draggable key={photo.id} draggableId={photo.id} index={index}>
                        {(provided) => (
                          <div
                            className="photo"
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <img src={URL.createObjectURL(photo.file)} alt="place" />
                            <button type="button" onClick={() => handleRemovePhoto(photo.id)}>
                              <BiTrash />
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}

                    <input
                      id="image"
                      type="file"
                      style={{ display: "none" }}
                      accept="image/*"
                      onChange={handleUploadPhotos}
                      multiple
                    />
                    <label htmlFor="image" className={photos.length < 1 ? "alone" : "together"}>
                      <div className="icon">
                        <IoIosImages />
                      </div>
                      <p>Upload from your device</p>
                    </label>

                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            <h3>What make your place attractive and exciting?</h3>
            <div className="description">
              <p>Title</p>
              <input
                type="text"
                name="title"
                value={formDescription.title}
                onChange={handleChangeDescription}
                required
              />
              <p>Description</p>
              <textarea
                name="description"
                value={formDescription.description}
                onChange={handleChangeDescription}
                required
              />
              <p>Highlight</p>
              <input
                type="text"
                name="highlight"
                value={formDescription.highlight}
                onChange={handleChangeDescription}
                required
              />
              <p>Highlight details</p>
              <textarea
                name="highlightDesc"
                value={formDescription.highlightDesc}
                onChange={handleChangeDescription}
                required
              />
              <p>Now, set your PRICE</p>
              <span>$</span>
              <input
                type="number"
                name="price"
                value={formDescription.price}
                onChange={handleChangeDescription}
                className="price"
                required
              />
            </div>
          </div>

          <button className="submit_btn" type="submit">
            CREATE YOUR LISTING
          </button>
        </form>
      </div>

      <Footer />
    </>
  );
};

export default CreateListing;
