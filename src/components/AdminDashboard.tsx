"use client";
import React, { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  where,
  Timestamp,
  getDoc,
  addDoc,
  deleteDoc,
  setDoc,
  getDocs,
} from "firebase/firestore";
import { getDb, getAuthService, handleFirestoreError } from "../lib/firebase";
import { AdminMediaUploader } from "./AdminMediaUploader";
import { AdminPackagesEditor } from "./AdminPackagesEditor";
import { AdminBoutiqueEditor } from "./AdminBoutiqueEditor";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Calendar as CalendarIcon,
  DollarSign,
  Activity,
  Filter,
  X,
  Image as ImageIcon,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { format, startOfDay, endOfDay } from "date-fns";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export function AdminDashboard() {
  const db = getDb();
  const auth = getAuthService();
  const [bookings, setBookings] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();

  const [activeView, setActiveView] = useState<
    "logistics" | "portfolio" | "packages" | "boutique"
  >("logistics");

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expertiseFilter, setExpertiseFilter] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");



  // Portfolio
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
  const [mediaTypeFilter, setMediaTypeFilter] = useState("all");

  useEffect(() => {
    if (!isAuthorized) return;
    const qPortfolio = query(
      collection(getDb(), "portfolio_items"),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(
      qPortfolio,
      (snapshot) => {
        setPortfolioItems(
          snapshot.docs.map((doc) => {
             const data = doc.data();
             return {
                id: doc.id,
                title: typeof data.title === 'string' ? data.title : "",
                description: typeof data.description === 'string' ? data.description : "",
                url: typeof data.url === 'string' ? data.url : "",
                type: typeof data.type === 'string' ? data.type : "image",
                theme_category: typeof data.theme_category === 'string' ? data.theme_category : "",
                category: typeof data.category === 'string' ? data.category : "",
                author: typeof data.author === 'string' ? data.author : "",
                tags: Array.isArray(data.tags) ? data.tags.filter(t => typeof t === 'string') : [],
                artistry_themes: Array.isArray(data.artistry_themes) ? data.artistry_themes.filter(t => typeof t === 'string') : [],
                production_notes: typeof data.production_notes === 'string' ? data.production_notes : "",
                text: typeof data.text === 'string' ? data.text : ""
             } as any;
          })
        );
      },
      (error) => {
        handleFirestoreError(error, "list", "portfolio_items");
      },
    );
    return () => unsub();
  }, [isAuthorized]);

  useEffect(() => {
    const unsubAuth = auth.onAuthStateChanged(async (user) => {
      setLoading(true);
      if (!user) {
        router.push("/admin/login");
        return;
      }
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().role === "admin") {
          setIsAuthorized(true);
        } else if (
          user.email === "hi@arrdublu.us" ||
          user.email === "admin@nowforevermoods.com"
        ) {
          await setDoc(
            doc(db, "users", user.uid),
            { email: user.email, role: "admin" },
            { merge: true },
          );
          setIsAuthorized(true);
        } else {
          router.push("/admin/login");
        }
      } catch (e) {
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    });

    return () => unsubAuth();
  }, [router, auth, db]);

  useEffect(() => {
    if (!isAuthorized) return;
    const qBookings = query(
      collection(db, "bookings"),
      orderBy("createdAt", "desc"),
    );
    const unsubBookings = onSnapshot(qBookings, (snapshot) => {
      setBookings(snapshot.docs.map((doc) => {
         const data = doc.data();
         return {
           id: doc.id,
           packageId: typeof data.packageId === 'string' ? data.packageId : "",
           packageName: typeof data.packageName === 'string' ? data.packageName : "",
           userId: typeof data.userId === 'string' ? data.userId : "",
           status: typeof data.status === 'string' ? data.status : "",
           date: typeof data.date === 'string' ? data.date : "",
           time: typeof data.time === 'string' ? data.time : "",
           amount: Number(data.amount) || 0,
           createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : ""
         } as any;
      }));
    }, (error) => {
      handleFirestoreError(error, "list" as any, "bookings");
    });
    return () => unsubBookings();
  }, [isAuthorized, db]);

  useEffect(() => {
    if (!isAuthorized) return;
    setLoading(true);
    let qTransactions = query(
      collection(db, "transactions"),
      orderBy("createdAt", "desc"),
    );
    if (statusFilter !== "all")
      qTransactions = query(qTransactions, where("status", "==", statusFilter));
    if (dateFrom)
      qTransactions = query(
        qTransactions,
        where(
          "createdAt",
          ">=",
          Timestamp.fromDate(startOfDay(new Date(dateFrom))),
        ),
      );
    if (dateTo)
      qTransactions = query(
        qTransactions,
        where(
          "createdAt",
          "<=",
          Timestamp.fromDate(endOfDay(new Date(dateTo))),
        ),
      );

    const unsubscribe = onSnapshot(qTransactions, (snapshot) => {
      setTransactions(
        snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
             id: doc.id,
             amount: Number(data.amount) || 0,
             status: typeof data.status === 'string' ? data.status : "",
             currency: typeof data.currency === 'string' ? data.currency : "",
             bookingId: typeof data.bookingId === 'string' ? data.bookingId : "",
             userId: typeof data.userId === 'string' ? data.userId : "",
             createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : ""
          } as any;
        })
      );
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, "list" as any, "transactions");
    });
    return () => unsubscribe();
  }, [statusFilter, dateFrom, dateTo, isAuthorized, db]);

  const resetFilters = () => {
    setStatusFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [deletingBookingId, setDeletingBookingId] = useState<string | null>(null);

  const handleDeleteSanitized = async () => {
    const sanitizedBookings = bookings.filter((b) => b.status === "sanitized");
    if (sanitizedBookings.length === 0) {
      alert("No sanitized bookings found.");
      return;
    }

    if (
      !confirm(
        `DANGER: You are about to permanently delete ALL (${sanitizedBookings.length}) sanitized bookings. This action cannot be undone. Continue?`,
      )
    )
      return;

    setIsBulkDeleting(true);
    try {
      let count = 0;
      for (const booking of sanitizedBookings) {
        // Cleanup availability
        try {
          const qAvail = query(
            collection(db, "availability"),
            where("bookingId", "==", booking.id),
          );
          const availSnap = await getDocs(qAvail);
          const deletePromises = availSnap.docs.map((d) =>
            deleteDoc(doc(db, "availability", d.id)),
          );
          await Promise.all(deletePromises);
        } catch (e) {
          console.warn(`Failed to cleanup availability for ${booking.id}`, e);
        }

        // Delete booking
        await deleteDoc(doc(db, "bookings", booking.id));
        count++;
      }
      alert(`Purge complete. ${count} sanitized records removed.`);
    } catch (err) {
      console.error("Bulk delete failed:", err);
      alert("Critical: Purge process encountered an error.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    setDeletingBookingId(bookingId);
    try {
      // Find and delete associated availability
      try {
        const qAvail = query(
          collection(db, "availability"),
          where("bookingId", "==", bookingId)
        );
        const availSnap = await getDocs(qAvail);
        const deletePromises = availSnap.docs.map(d => deleteDoc(doc(db, "availability", d.id)));
        await Promise.all(deletePromises);
      } catch (availErr) {
        console.warn("Could not cleanup availability:", availErr);
      }

      await deleteDoc(doc(db, "bookings", bookingId));
    } catch (err) {
      console.error(err);
      let errorMsg = "An error occurred during deletion.";
      if (err instanceof Error) {
         try {
            const parsed = JSON.parse(err.message);
            errorMsg = parsed.error || err.message;
         } catch {
            errorMsg = err.message;
         }
      }
      alert(`Deletion Failed: ${errorMsg}`);
    } finally {
      setDeletingBookingId(null);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, "bookings", id), { status, updatedAt: new Date() });
      
      // Also update availability status
      try {
        const qAvail = query(
          collection(db, "availability"),
          where("bookingId", "==", id)
        );
        const availSnap = await getDocs(qAvail);
        const updatePromises = availSnap.docs.map(d => updateDoc(doc(db, "availability", d.id), { status }));
        await Promise.all(updatePromises);
      } catch (availErr) {
        console.warn("Could not sync availability status:", availErr);
      }
    } catch (err) {
      handleFirestoreError(err, 'update', `bookings/${id}`);
    }
  };
  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "pending":
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
      case "sanitized":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-600 border-zinc-500/20";
    }
  };

  if (loading || !isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-bg font-sans text-brand-text">
        <div className="text-[10px] uppercase font-bold tracking-[0.3em] text-brand-muted animate-pulse">
          Initializing Terminal...
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-brand-bg pt-24 font-sans text-brand-text">
      <aside className="w-64 border-r border-brand-line bg-white p-8">
        <h2 className="mb-8 font-serif text-lg font-light text-brand-black tracking-tight">
          Admin Console
        </h2>
        <nav className="space-y-4">
          <button
            onClick={() => setActiveView("logistics")}
            className={`w-full text-left text-[10px] uppercase tracking-widest font-bold ${activeView === "logistics" ? "text-brand-accent" : "text-brand-muted hover:text-brand-black"}`}
          >
            Logistics & Ledger
          </button>
          <button
            onClick={() => setActiveView("portfolio")}
            className={`w-full text-left text-[10px] uppercase tracking-widest font-bold ${activeView === "portfolio" ? "text-brand-accent" : "text-brand-muted hover:text-brand-black"}`}
          >
            Assets & Portfolio
          </button>
          <button
            onClick={() => setActiveView("packages")}
            className={`w-full text-left text-[10px] uppercase tracking-widest font-bold ${activeView === "packages" ? "text-brand-accent" : "text-brand-muted hover:text-brand-black"}`}
          >
            Packages
          </button>
          <button
            onClick={() => setActiveView("boutique")}
            className={`w-full text-left text-[10px] uppercase tracking-widest font-bold ${activeView === "boutique" ? "text-brand-accent" : "text-brand-muted hover:text-brand-black"}`}
          >
            Boutique Manage
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-8 md:p-12 space-y-12 pb-32">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-serif font-light mb-1 text-brand-black tracking-tight">
              {activeView === "logistics"
                ? "Administrative Terminal"
                : activeView === "portfolio"
                  ? "Assets & Portfolio"
                  : activeView === "packages"
                  ? "Package Management"
                  : "Boutique"}
            </h1>
            <p className="text-brand-muted text-[10px] tracking-[0.3em] font-bold uppercase italic">
              {activeView === "logistics"
                ? "Logistics & Oversight"
                : activeView === "portfolio"
                  ? "Manage Media & Content"
                  : activeView === "packages"
                  ? "Manage Experience Tiers"
                  : "Products & Orders"}
            </p>
          </div>
          {activeView === "logistics" && (
            <div className="flex gap-4">
              {bookings.some((b) => b.status === "sanitized") && (
                <Button
                  variant="outline"
                  onClick={handleDeleteSanitized}
                  disabled={isBulkDeleting}
                  className="border-red-200 text-red-600 hover:bg-red-50 rounded-none text-[10px] uppercase tracking-widest font-bold h-10 px-6 transition-all active:scale-95"
                >
                  {isBulkDeleting ? (
                    <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-3 w-3 mr-2" />
                  )}
                  {isBulkDeleting ? "Purging..." : "Purge Sanitized"}
                </Button>
              )}
              <Button
                variant="outline"
                className="border-brand-line rounded-none text-[10px] uppercase tracking-widest font-bold bg-white text-brand-black"
              >
                Export Vault Data
              </Button>
            </div>
          )}
        </div>

        {activeView === "logistics" ? (
          <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-brand-line border border-brand-line shadow-sm">
              {[
                {
                  label: "Active Requests",
                  value: bookings.length,
                  icon: CalendarIcon,
                },
                {
                  label: "Confirmed Revenue",
                  value: `$${transactions.reduce((acc, t) => acc + (t.amount || 0), 0).toLocaleString()}`,
                  icon: DollarSign,
                },
                {
                  label: "Portfolio Items",
                  value: portfolioItems.length,
                  icon: ImageIcon,
                },
                { label: "Terminal Health", value: "Optimal", icon: Activity },
              ].map((stat, i) => (
                <Card
                  key={i}
                  className="bg-white border-none rounded-none shadow-none"
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-[10px] font-bold text-brand-muted uppercase tracking-widest">
                      {stat.label}
                    </CardTitle>
                    <stat.icon className="h-3 w-3 text-brand-accent" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-light text-brand-black tracking-tight">
                      {stat.value}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-white border-brand-line rounded-none shadow-none overflow-hidden">
              <ScrollArea className="h-[400px]">
                <table className="w-full text-left">
                  <thead className="bg-brand-surface text-brand-muted text-[9px] uppercase tracking-[0.2em] font-bold sticky top-0 z-10">
                    <tr>
                      <th className="p-6">Entity Reference</th>
                      <th className="p-6">Date</th>
                      <th className="p-6">Status</th>
                      <th className="p-6 text-right">Protection</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-line">
                    {bookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className="hover:bg-brand-surface transition-colors"
                      >
                        <td className="p-6 text-sm font-medium">
                          <div className="flex flex-col">
                            <span>{booking.packageName}</span>
                            <span className="text-[10px] text-brand-muted font-normal lowercase">{booking.id}</span>
                          </div>
                        </td>
                        <td className="p-6 text-sm text-brand-muted">
                          {booking.date
                            ? format(new Date(booking.date), "MMM dd, yyyy")
                            : "N/A"}
                        </td>
                        <td className="p-6">
                          <Badge
                            variant="outline"
                            className={`${getStatusColor(booking.status)} rounded-none uppercase text-[8px] tracking-[0.2em] py-1 px-3 font-bold`}
                          >
                            {booking.status}
                          </Badge>
                        </td>
                        <td className="p-6 text-right">
                          <div className="flex justify-end gap-2 items-center">
                            {booking.status === "pending" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => updateStatus(booking.id, "confirmed")}
                                className="border-emerald-200 text-emerald-600 hover:bg-emerald-50 rounded-none text-[9px] uppercase tracking-widest font-bold h-7"
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Confirm
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteBooking(booking.id)}
                              disabled={deletingBookingId === booking.id}
                              className="border-red-200 text-red-600 hover:bg-red-50 rounded-none text-[9px] uppercase tracking-widest font-bold h-7 disabled:opacity-50"
                            >
                              {deletingBookingId === booking.id ? (
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              ) : (
                                <Trash2 className="h-3 w-3 mr-1" />
                              )}
                              {deletingBookingId === booking.id ? "Deleting..." : "Delete"}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </Card>
          </div>
        ) : activeView === "portfolio" ? (
          <div className="space-y-8">
            <Card className="bg-white border-brand-line rounded-none shadow-none">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 space-y-2">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-brand-muted">Media Type</Label>
                    <select
                      value={mediaTypeFilter}
                      onChange={(e) => setMediaTypeFilter(e.target.value)}
                      className="w-full h-10 border border-brand-line px-3 text-sm focus:outline-none focus:border-brand-accent bg-transparent"
                    >
                      <option value="all">All Types</option>
                      <option value="image">Photos</option>
                      <option value="video">Videos</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>
            <AdminMediaUploader mediaTypeFilter={mediaTypeFilter} />
          </div>
        ) : activeView === "packages" ? (
          <div className="space-y-8">
            <AdminPackagesEditor />
          </div>
        ) : (
          <div className="space-y-8">
            <AdminBoutiqueEditor />
          </div>
        )}
      </main>
    </div>
  );
}
