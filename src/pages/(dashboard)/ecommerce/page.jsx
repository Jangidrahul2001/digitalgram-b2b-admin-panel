import React, { useState, useRef, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PageLayout } from "../../../components/layouts/page-layout";
import { SidebarPageTransition } from "../../../components/ui/sidebar-page-transition";
import { ShoppingBag, PlusCircle, ShoppingCart } from "@/components/icons";
// import { useEcommerce } from "../../../hooks/use-ecommerce";
import { ProductListTab } from "./tabs/product-list-tab";
import { ProductAddTab } from "./tabs/product-add-tab";
import { OrderListTab } from "./tabs/order-list-tab";
import { OrderViewTab } from "./tabs/order-view-tab";
import { ProductUpdateTab } from "./tabs/product-edit-tab";

/**
 * EcommercePage - Integrated with SidebarPageTransition for design parity.
 */
export default function EcommercePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("tab") || "product_list",
  );
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  useEffect(() => {
    const currentTab = searchParams.get("tab") || "product_list";
    if (activeTab !== currentTab) {
      setActiveTab(currentTab);
    }
  }, [searchParams, activeTab]);
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  // const { orders, isLoadingOrders } = useEcommerce(activeTab);

  const handleTabChange = (value) => {
    setActiveTab(value);
    setSearchParams({ tab: value });
  };

  const isDetailView = activeTab === "product_update" || activeTab === "order_view";
  const tabsRef = useRef(null);

  // Sync horizontal scroll for the navigation bar
  useEffect(() => {
    const container = tabsRef.current;
    if (!container) return;
    const handleWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };
    container.addEventListener("wheel", handleWheel, { passive: false });
    return () => container.removeEventListener("wheel", handleWheel);
  }, []);

  const ecommerceTabs = [
    { id: "product_list", label: "Product List", icon: <ShoppingBag className="w-4 h-4" /> },
    { id: "product_add", label: "Product Add", icon: <PlusCircle className="w-4 h-4" /> },
    { id: "order_list", label: "Order List", icon: <ShoppingCart className="w-4 h-4" /> },
  ];

  return (
    <PageLayout showBackButton={false} className="!pt-4">
      <SidebarPageTransition className="flex flex-col gap-6">
        {/* Header Section */}
        {!isDetailView && (
          <div className="px-1">
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase">
              E-Commerce
            </h1>
            <p className="text-sm font-medium text-slate-500">Inventory Management & Fulfillment Tracking</p>
          </div>
        )}

        {/* Tab Navigation - Matches Settings Page Underline Style */}
        {!isDetailView && (
          <div className="sticky top-0 z-30 bg-white -mx-4 md:-mx-6 px-4 md:px-6 border-b border-slate-100 mb-2">
            <div
              ref={tabsRef}
              className="flex items-center gap-8 overflow-x-auto scrollbar-hide relative z-0"
            >
              {ecommerceTabs.map((tab) => {
                const value = tab.id;
                const isActive = activeTab === value;
                return (
                  <button
                    key={value}
                    onClick={() => handleTabChange(value)}
                    className={`
                      relative flex items-center gap-2 px-1 py-5 text-sm font-bold transition-all duration-300 z-10 cursor-pointer whitespace-nowrap shrink-0 group
                      ${isActive ? "text-slate-900" : "text-slate-400 hover:text-slate-700"}
                    `}
                  >
                    <span className={`relative z-20 flex items-center gap-2.5 ${isActive ? 'scale-105' : 'scale-100'} transition-transform`}>
                      {tab.icon && React.cloneElement(tab.icon, {
                        className: `w-4 h-4 transition-colors ${isActive ? "text-slate-900" : "text-slate-400 group-hover:text-slate-500"}`
                      })}
                      {tab.label}
                    </span>

                    {isActive && (
                      <motion.div
                        layoutId="active-tab-underline"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-900"
                        transition={{ type: "spring", stiffness: 400, damping: 40, mass: 0.8 }}
                      />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab Content Division */}
        <div className="mt-4">
          <AnimatePresence mode="popLayout" initial={false}>
            <SidebarPageTransition key={activeTab}>
              {activeTab === "product_list" && (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-3 px-1">
                    <div className="w-1.5 h-6 bg-slate-900 rounded-full shadow-sm" />
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Product List</h2>
                  </div>
                  <ProductListTab
                    handleTabChange={handleTabChange}
                    selectedProductId={selectedProductId}
                    setSelectedProductId={setSelectedProductId}
                  />
                </div>
              )}

              {activeTab === "product_add" && (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-3 px-1">
                    <div className="w-1.5 h-6 bg-slate-900 rounded-full shadow-sm" />
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Add New Product</h2>
                  </div>
                  <ProductAddTab />
                </div>
              )}

              {activeTab === "product_update" && (
                <ProductUpdateTab
                  selectedProductId={selectedProductId}
                  handleTabChange={handleTabChange}
                />
              )}

              {activeTab === "order_list" && (
                <div className="flex flex-col gap-6">
                  <div className="flex items-center gap-3 px-1">
                    <div className="w-1.5 h-6 bg-slate-900 rounded-full shadow-sm" />
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Order History</h2>
                  </div>
                  <OrderListTab
                    orders={orders}
                    isLoading={isLoadingOrders}
                    handleTabChange={handleTabChange}
                    setSelectedOrderId={setSelectedOrderId}
                  />
                </div>
              )}

              {activeTab === "order_view" && (
                <OrderViewTab
                  orderId={selectedOrderId}
                  handleTabChange={handleTabChange}
                />
              )}
            </SidebarPageTransition>
          </AnimatePresence>
        </div>
      </SidebarPageTransition>
    </PageLayout>
  );
}
