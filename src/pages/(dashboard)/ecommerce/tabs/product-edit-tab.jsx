import React, { useState, useEffect } from "react";
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
import { Save } from "@/components/icons";
import { useFetch } from "../../../../hooks/useFetch";
import { apiEndpoints } from "../../../../api/apiEndpoints";
import { toast } from "sonner";
import { handleValidationError } from "../../../../utils/helperFunction";
// import { usePatch } from "../../../../hooks/usePatch";
import { usePut } from "../../../../hooks/usePut";

export function ProductUpdateTab({
  selectedProductId: productId,
  handleTabChange,
}) {
  const [productName, setProductName] = useState("");
  const [stock, setStock] = useState("");
  const [price, setPrice] = useState("");
  const [discount, setDiscount] = useState("");
  const [discountType, setDiscountType] = useState("flat");
  const [category, setCategory] = useState("hardware");
  const [description, setDescription] = useState("");
  const [productImage, setProductImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const { refetch: fetchProduct } = useFetch(
    `${apiEndpoints.fetchSingleProduct}/${productId}`,
    {
      onSuccess: (data) => {
        
        if (data?.success && data?.data) {
          const product = data?.data;
          setProductName(product.name || "");
          setStock(product.stock?.toString() || "");
          setPrice(product.price?.toString() || "");
          setCategory(product.category || "hardware");
          setDescription(product.description || "");
          setDiscount(product.discount || 0);
          setDiscountType(product.discountType || "flat");
        }
        setIsLoading(false);
      },
      onError: (error) => {
        toast.error(handleValidationError(error) || "Failed to fetch product");
        setIsLoading(false);
      },
    },
    false,
  );

  const { put: updateProduct } = usePut(`${apiEndpoints.updateProduct}`, {
    onSuccess: (data) => {
      toast.success(data.message || "Product updated successfully");
      setProductName("");
      setStock("");
      setPrice("");
      setDiscount("");
      setCategory("hardware");
      setDescription("");
      setProductImage(null);
      setErrors({});
      handleTabChange("product_list");
    },
    onError: (error) => {
      toast.error(handleValidationError(error) || "Failed to update product");
    },
  });

  useEffect(() => {
    if (productId) {
      fetchProduct();
    } else {
      handleTabChange("product_list");
    }
  }, [productId]);

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
    formData.append("discountType", discountType);
    formData.append("discount", Number(discount));
    formData.append("category", category);
    formData.append("description", description);
    if (productImage) {
      formData.append("productImage", productImage);
    }

    await updateProduct(productId, formData);
  };

  if (isLoading) {
    return (
      <Card className="border-none shadow-md bg-white rounded-xl">
        <CardContent className="p-6">
          <p className="text-center text-slate-500">Loading product...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none shadow-md bg-white rounded-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-slate-800">
          Update Product
        </CardTitle>
        <CardDescription>Update the product details below.</CardDescription>
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
              <Label>Product Image (Optional)</Label>
              <Input
                type="file"
                className="bg-white file:text-slate-500 cursor-pointer"
                onChange={(e) => setProductImage(e.target.files[0])}
              />
              <p className="text-xs text-slate-500">
                Leave empty to keep existing image
              </p>
            </div>
          </div>

          <div className="flex justify-start gap-4 pt-4 border-t border-slate-100">
            <Button
              type="submit"
              className="bg-slate-900 text-white hover:bg-slate-800"
            >
              <Save className="w-4 h-4 mr-2" />
              Update Product
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
