import React, { useState } from "react";
import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import { Select } from "../../../../components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../../components/ui/card";
import { Plus } from "@/components/icons";
import { usePost } from "../../../../hooks/usePost";
import { apiEndpoints } from "../../../../api/apiEndpoints";
import { toast } from "sonner";
import { handleValidationError } from "../../../../utils/helperFunction";

export function ProductAddTab({  }) {
  const [productName, setProductName] = useState("");
  const [stock, setStock] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [discountType, setDiscountType] = useState("flat");
  const [category, setCategory] = useState("hardware");
  const [description, setDescription] = useState("");
  const [productImage, setProductImage] = useState(null);
  const [errors, setErrors] = useState({});

  const { post: addProduct } = usePost(`${apiEndpoints?.addProducts}`, {
    onSuccess: (data) => {
      
      // Reset form
      setProductName("");
      setStock("");
      setPrice("");
      setDiscount("");
      setCategory("hardware");
      setDescription("");
      setProductImage(null);
      setErrors({});
      toast.success(data.message||"Product added successfully");
    },
    onError: (error) => {
      console.error("Failed to add product:", error);
      toast.error(handleValidationError(error)||"Something went wrong");
    },
  });

  const validate = () => {
    const newErrors = {};

    if (!productName.trim()) newErrors.productName = "Product name is required";
    if (!stock.trim()) newErrors.stock = "Stock is required";
    else if (isNaN(stock) || Number(stock) < 0)
      newErrors.stock = "Stock must be a valid number";
    if (!price.trim()) newErrors.price = "Price is required";
    else if (isNaN(price) || Number(price) <= 0)
      newErrors.price = "Price must be a valid number";
    if (discount && (isNaN(discount) || Number(discount) < 0))
      newErrors.discount = "Discount must be a valid number";
    if (!category) newErrors.category = "Category is required";
    if (!description.trim()) newErrors.description = "Description is required";
    if (!productImage) newErrors.productImage = "Product image is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const formData = new FormData();
    formData.append("name", productName);
    formData.append("stock", Number(stock));
    formData.append("price", Number(price));
    if (discount) formData.append("discount", Number(discount));
    if (discount) formData.append("discountType", discountType);
    formData.append("category", category);
    formData.append("description", description);
    formData.append("productImage", productImage);

    await addProduct(formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  };

  return (
    <Card className="border-none shadow-md bg-white rounded-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-800">
          Add New Product
        </CardTitle>
        <CardDescription>
          Fill out the form below to create a newly listed product.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Product Name</Label>
              <Input
                placeholder="Product Name"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                error={errors.productName}
              />
            </div>
            <div className="space-y-2">
              <Label>Stock Number</Label>
              <Input
                placeholder="Stock"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                error={errors.stock}
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                options={[
                  { label: "Hardware", value: "hardware" },
                  { label: "Accessories", value: "accessories" },
                  { label: "Software", value: "software" },
                ]}
                value={category}
                onChange={setCategory}
                placeholder="Select Category"
                searchable={false}
              />
              {errors.category && (
                <p className="text-sm text-red-500">{errors.category}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Price</Label>
              <Input
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                error={errors.price}
              />
            </div>

            <div className="space-y-2">
              <Label>Discount</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Value"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="flex-1"
                  error={errors.discount}
                />
                <div className="w-32">
                  <Select
                    options={[
                      { label: "Flat", value: "flat" },
                      { label: "%", value: "percentage" },
                    ]}
                    value={discountType}
                    onChange={setDiscountType}
                    placeholder="Type"
                    searchable={false}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Description</Label>
              <textarea
                className="w-full min-h-[100px] rounded-md border border-slate-200 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                placeholder="Product Description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Product Image</Label>
              <Input
                type="file"
                className="bg-white file:text-slate-500 cursor-pointer"
                onChange={(e) => setProductImage(e.target.files[0])}
                error={errors.productImage}
              />
            </div>
          </div>

          <div className="flex justify-start gap-4 pt-4 border-t border-slate-100">
            <Button
              type="submit"
              className="bg-slate-900 text-white hover:bg-slate-800"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-slate-200 text-slate-600"
                onClick={() => handleTabChange("product_list")}
            >
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
