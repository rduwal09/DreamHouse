import "../styles/CreateListing.scss"; // reuse same styles
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { categories, types, facilities } from "../data";
import { RemoveCircleOutline, AddCircleOutline } from "@mui/icons-material";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { IoIosImages } from "react-icons/io";
import { BiTrash } from "react-icons/bi";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import toast from "react-hot-toast";


// Utility function to resolve image URLs correctly
const getImageUrl = (path) => {
  if (!path) return null;
  const relativePath = path.replace(/^public[\\/]/, "");
  return `http://localhost:3001/${encodeURI(relativePath)}`;
};

const EditListing = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);

  const [category, setCategory] = useState("");
  const [type, setType] = useState("");

  const [formLocation, setFormLocation] = useState({
    streetAddress: "",
    aptSuite: "",
    city: "",
    province: "",
    country: "",
  });

  const [guestCount, setGuestCount] = useState(1);
  const [bedroomCount, setBedroomCount] = useState(1);
  const [bedCount, setBedCount] = useState(1);
  const [bathroomCount, setBathroomCount] = useState(1);

  const [amenities, setAmenities] = useState([]);

  const [photos, setPhotos] = useState([]); // includes new uploads
  const [existingPhotos, setExistingPhotos] = useState([]); // paths from server

  const [formDescription, setFormDescription] = useState({
    title: "",
    description: "",
    highlight: "",
    highlightDesc: "",
    price: 0,
  });

  // Fetch listing details
  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/properties/${id}`);
        const data = res.data;
        setCategory(data.category);
        setType(data.type);
        setFormLocation({
          streetAddress: data.streetAddress,
          aptSuite: data.aptSuite,
          city: data.city,
          province: data.province,
          country: data.country,
        });
        setGuestCount(data.guestCount);
        setBedroomCount(data.bedroomCount);
        setBedCount(data.bedCount);
        setBathroomCount(data.bathroomCount);
        setAmenities(data.amenities || []);
        setExistingPhotos(data.listingPhotoPaths || []);
        setFormDescription({
          title: data.title,
          description: data.description,
          highlight: data.highlight,
          highlightDesc: data.highlightDesc,
          price: data.price,
        });
      } catch (err) {
        console.error("Failed to fetch listing", err);
      }
    };
    fetchListing();
  }, [id]);

  const handleChangeLocation = (e) => {
    const { name, value } = e.target;
    setFormLocation({ ...formLocation, [name]: value });
  };

  const handleChangeDescription = (e) => {
    const { name, value } = e.target;
    setFormDescription({ ...formDescription, [name]: value });
  };

  const handleSelectAmenities = (facility) => {
    if (amenities.includes(facility)) {
      setAmenities((prev) => prev.filter((f) => f !== facility));
    } else {
      setAmenities((prev) => [...prev, facility]);
    }
  };

  const handleUploadPhotos = (e) => {
    const newPhotos = Array.from(e.target.files).map((file) => ({
      id: uuidv4(),
      file,
    }));
    setPhotos((prev) => [...prev, ...newPhotos]);
  };

  const handleRemovePhoto = (id) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  };

  const removeExistingPhoto = (index) => {
    const removed = existingPhotos[index];
    setExistingPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotos((prev) => [...prev, { id: uuidv4(), file: null, removePath: removed }]);
  };

  const handleDragPhoto = (result) => {
    if (!result.destination) return;
    const items = Array.from(photos);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setPhotos(items);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

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
      toast.error("Please fill all required fields!");
      return;
    }

    try {
      const listingForm = new FormData();
      listingForm.append("category", category);
      listingForm.append("type", type);
      Object.keys(formLocation).forEach((key) => listingForm.append(key, formLocation[key]));
      listingForm.append("guestCount", guestCount);
      listingForm.append("bedroomCount", bedroomCount);
      listingForm.append("bedCount", bedCount);
      listingForm.append("bathroomCount", bathroomCount);
      listingForm.append("amenities", JSON.stringify(amenities));
      Object.keys(formDescription).forEach((key) => listingForm.append(key, formDescription[key]));

      photos.forEach((photo) => {
        if (photo.file) listingForm.append("listingPhotos", photo.file);
        if (photo.removePath) listingForm.append("removedPhotos", photo.removePath);
      });

      const token = localStorage.getItem("token"); // add your JWT token
      const response = await axios.put(`http://localhost:3001/properties/${id}`, listingForm, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        toast.success("Listing updated successfully!");
        navigate("/host/dashboard");
      } else {
        toast.error("Failed to update listing");
      }
    } catch (err) {
      console.error("Update failed", err.response?.data || err.message);
      toast.error("Failed to update listing: " + (err.response?.data?.message || err.message));
    }
  };

  return (
    <>
      <Navbar />
      <div className="create-listing">
        <h1>Edit Your Place</h1>
        <form onSubmit={handleSubmit}>
          {/* Step 1 */}
          <div className="create-listing_step1">
            <h2>Step 1: Tell us about your place</h2>
            <hr />
            <h3>Category</h3>
            <div className="category-list">
              {categories
                .filter((c) => c.label !== "All")
                .map((item, idx) => (
                  <div
                    key={idx}
                    className={`category ${category === item.label ? "selected" : ""}`}
                    onClick={() => setCategory(item.label)}
                  >
                    <div className="category_icon">{item.icon}</div>
                    <p>{item.label}</p>
                  </div>
                ))}
            </div>

            <h3>Type</h3>
            <div className="type-list">
              {types.map((item, idx) => (
                <div
                  key={idx}
                  className={`type ${type === item.name ? "selected" : ""}`}
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

            <h3>Location</h3>
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
                <p>Apartment/Suite</p>
                <input type="text" name="aptSuite" value={formLocation.aptSuite} onChange={handleChangeLocation} />
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

            <h3>Basics</h3>
            <div className="basics">
              {[
                { label: "Guests", value: guestCount, setter: setGuestCount },
                { label: "Bedrooms", value: bedroomCount, setter: setBedroomCount },
                { label: "Beds", value: bedCount, setter: setBedCount },
                { label: "Bathrooms", value: bathroomCount, setter: setBathroomCount },
              ].map((item, idx) => (
                <div className="basic" key={idx}>
                  <p>{item.label}</p>
                  <div className="basic_count">
                    <RemoveCircleOutline
                      onClick={() => item.value > 1 && item.setter(item.value - 1)}
                      sx={{ fontSize: 25, cursor: "pointer" }}
                    />
                    <p>{item.value}</p>
                    <AddCircleOutline
                      onClick={() => item.setter(item.value + 1)}
                      sx={{ fontSize: 25, cursor: "pointer" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2 */}
          <div className="create-listing_step2">
            <h2>Step 2: Make your place stand out</h2>
            <hr />
            <h3>Amenities</h3>
            <div className="amenities">
              {facilities.map((item, idx) => (
                <div
                  key={idx}
                  className={`facility ${amenities.includes(item.name) ? "selected" : ""}`}
                  onClick={() => handleSelectAmenities(item.name)}
                >
                  <div className="facility_icon">{item.icon}</div>
                  <p>{item.name}</p>
                </div>
              ))}
            </div>

            <h3>Photos</h3>
            <DragDropContext onDragEnd={handleDragPhoto}>
              <Droppable droppableId="photos" direction="horizontal">
                {(provided) => (
                  <div className="photos" {...provided.droppableProps} ref={provided.innerRef}>
                    {existingPhotos.map((path, idx) => (
                      <div key={idx} className="photo">
                        <img src={getImageUrl(path)} alt="listing" />
                        <button type="button" onClick={() => removeExistingPhoto(idx)}>
                          <BiTrash />
                        </button>
                      </div>
                    ))}

                    {photos.map((photo, idx) => (
                      <Draggable key={photo.id} draggableId={photo.id} index={idx}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="photo"
                          >
                            <img src={photo.file ? URL.createObjectURL(photo.file) : ""} alt="new" />
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
                      multiple
                      onChange={handleUploadPhotos}
                    />
                    <label
                      htmlFor="image"
                      className={photos.length + existingPhotos.length < 1 ? "alone" : "together"}
                    >
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

            <h3>Description & Price</h3>
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
              <p>Highlight Details</p>
              <textarea
                name="highlightDesc"
                value={formDescription.highlightDesc}
                onChange={handleChangeDescription}
                required
              />
              <p>Price</p>
              <span>$</span>
              <input
                type="number"
                name="price"
                value={formDescription.price}
                onChange={handleChangeDescription}
                required
                className="price"
              />
            </div>
          </div>

          <button type="submit" className="submit_btn">
            Update Listing
          </button>
        </form>
      </div>
      <Footer />
    </>
  );
};

export default EditListing;
