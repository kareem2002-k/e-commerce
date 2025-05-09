"use client"

import { useState, useEffect } from "react"
import { useAdminContent, HeroSection } from "@/hooks/useContent"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Trash, PencilLine, Save, Plus, ArrowLeft, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ImageUploader } from "@/components/ImageUploader"
import { motion } from "framer-motion"
import { Skeleton } from "@/components/ui/skeleton"

export default function HeroSectionAdmin() {
  const { heroSections, loading, error, fetchHeroSections, saveHeroSection, deleteHeroSection } = useAdminContent()
  const [editMode, setEditMode] = useState<boolean>(false)
  const [creating, setCreating] = useState<boolean>(false)
  const [currentHero, setCurrentHero] = useState<Partial<HeroSection> | null>(null)
  const [saving, setSaving] = useState<boolean>(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const router = useRouter()

  // Form state reset
  const resetForm = () => {
    setCurrentHero(null)
    setEditMode(false)
    setCreating(false)
  }

  // Create new hero section
  const handleCreate = () => {
    setCurrentHero({
      title: '',
      subtitle: '',
      description: '',
      primaryBtnText: '',
      primaryBtnLink: '',
      secondaryBtnText: '',
      secondaryBtnLink: '',
      imageUrl: '',
      active: true
    })
    setCreating(true)
    setEditMode(true)
  }

  // Edit existing hero section
  const handleEdit = (hero: HeroSection) => {
    setCurrentHero(hero)
    setCreating(false)
    setEditMode(true)
  }

  // Save changes
  const handleSave = async () => {
    if (!currentHero) return
    
    try {
      setSaving(true)
      await saveHeroSection(currentHero)
      resetForm()
      await fetchHeroSections()
    } catch (error) {
      console.error("Failed to save hero section:", error)
    } finally {
      setSaving(false)
    }
  }

  // Handle delete
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this hero section?")) {
      try {
        setDeleting(id)
        await deleteHeroSection(id)
        await fetchHeroSections()
      } catch (error) {
        console.error("Failed to delete hero section:", error)
      } finally {
        setDeleting(null)
      }
    }
  }

  // Form field change handler
  const handleChange = (field: string, value: string | boolean) => {
    if (!currentHero) return
    setCurrentHero({ ...currentHero, [field]: value })
  }

  // Handle image upload
  const handleImageUploaded = (images: { url: string; altText: string }[]) => {
    if (images.length > 0 && currentHero) {
      setCurrentHero({ ...currentHero, imageUrl: images[0].url })
    }
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-2">
          <Link href="/home/admin">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Hero Section Management</h1>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white shadow-md">
          <Plus className="h-4 w-4" />
          New Hero Section
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden border border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-2">
                <Skeleton className="h-6 w-3/4" />
              </CardHeader>
              <CardContent className="pb-2">
                <Skeleton className="h-32 w-full mb-2 rounded" />
                <Skeleton className="h-4 w-1/2 mb-1" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3 mt-1" />
              </CardContent>
              <CardFooter className="pt-2">
                <div className="flex justify-between w-full">
                  <Skeleton className="h-9 w-9 rounded" />
                  <Skeleton className="h-9 w-20 rounded" />
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
          <p className="text-red-600 dark:text-red-400 flex items-center">
            <span className="i-lucide-alert-circle mr-2" />
            {error}
          </p>
        </div>
      ) : null}

      {editMode ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="mb-8 border border-slate-200 dark:border-slate-800 shadow-sm">
            <CardHeader className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
              <CardTitle>{creating ? 'Create New Hero Section' : 'Edit Hero Section'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">Title</Label>
                  <Input 
                    id="title" 
                    value={currentHero?.title || ''} 
                    onChange={(e) => handleChange('title', e.target.value)}
                    placeholder="e.g., Cutting-Edge Electronics"
                    className="border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subtitle" className="text-sm font-medium">Subtitle</Label>
                  <Input 
                    id="subtitle" 
                    value={currentHero?.subtitle || ''} 
                    onChange={(e) => handleChange('subtitle', e.target.value)}
                    placeholder="e.g., New Arrivals"
                    className="border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium">Description</Label>
                <Textarea 
                  id="description" 
                  value={currentHero?.description || ''} 
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Enter hero section description"
                  className="min-h-[100px] border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="primaryBtnText" className="text-sm font-medium">Primary Button Text</Label>
                  <Input 
                    id="primaryBtnText" 
                    value={currentHero?.primaryBtnText || ''} 
                    onChange={(e) => handleChange('primaryBtnText', e.target.value)}
                    placeholder="e.g., Shop Now"
                    className="border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="primaryBtnLink" className="text-sm font-medium">Primary Button Link</Label>
                  <Input 
                    id="primaryBtnLink" 
                    value={currentHero?.primaryBtnLink || ''} 
                    onChange={(e) => handleChange('primaryBtnLink', e.target.value)}
                    placeholder="e.g., /home/products"
                    className="border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="secondaryBtnText" className="text-sm font-medium">Secondary Button Text</Label>
                  <Input 
                    id="secondaryBtnText" 
                    value={currentHero?.secondaryBtnText || ''} 
                    onChange={(e) => handleChange('secondaryBtnText', e.target.value)}
                    placeholder="e.g., View Deals"
                    className="border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="secondaryBtnLink" className="text-sm font-medium">Secondary Button Link</Label>
                  <Input 
                    id="secondaryBtnLink" 
                    value={currentHero?.secondaryBtnLink || ''} 
                    onChange={(e) => handleChange('secondaryBtnLink', e.target.value)}
                    placeholder="e.g., /home/deals"
                    className="border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Hero Image</Label>
                <div className="border rounded-md p-4 bg-slate-50 dark:bg-slate-900/50 border-dashed border-slate-300 dark:border-slate-700">
                  <ImageUploader 
                    onImagesUploaded={handleImageUploaded}
                    maxImages={1}
                    existingImages={currentHero?.imageUrl ? [{ url: currentHero.imageUrl, altText: 'Hero image' }] : []}
                    label="Upload Hero Image"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-md">
                <Switch 
                  id="active" 
                  checked={currentHero?.active || false}
                  onCheckedChange={(checked) => handleChange('active', checked)}
                  className="data-[state=checked]:bg-green-500"
                />
                <Label htmlFor="active" className="font-medium">Active (show on website)</Label>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 py-4">
              <Button
                variant="outline"
                onClick={resetForm}
                className="border-slate-300 dark:border-slate-700"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave}
                disabled={saving} 
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {!loading && heroSections.map((hero) => (
            <motion.div
              key={hero.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Card className={`h-full flex flex-col transition-all duration-200 hover:shadow-md ${hero.active ? "ring-2 ring-green-500 ring-opacity-50" : "border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700"}`}>
                <CardHeader className="pb-2">
                  <CardTitle className="flex justify-between items-center">
                    <span className="truncate text-lg">{hero.title || 'Untitled'}</span>
                    {hero.active && (
                      <span className="text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded-full font-medium">
                        Active
                      </span>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-2 flex-grow">
                  <div className="h-40 mb-3 rounded-md overflow-hidden relative group">
                    {hero.imageUrl ? (
                      <img 
                        src={hero.imageUrl} 
                        alt={hero.title || 'Hero Image'} 
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-200 dark:bg-slate-800">
                        <span className="text-slate-400 dark:text-slate-600">No image</span>
                      </div>
                    )}
                  </div>
                  {hero.subtitle && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-1">{hero.subtitle}</p>
                  )}
                  {hero.description && (
                    <p className="line-clamp-2 text-sm text-slate-700 dark:text-slate-300">{hero.description}</p>
                  )}
                </CardContent>
                <CardFooter className="pt-3 border-t border-slate-200 dark:border-slate-800 mt-auto">
                  <div className="flex justify-between w-full">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 dark:text-red-400 dark:hover:text-red-300 border-slate-200 dark:border-slate-800" 
                      onClick={() => handleDelete(hero.id)}
                      disabled={deleting === hero.id}
                    >
                      {deleting === hero.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash className="h-4 w-4" />
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEdit(hero)}
                      className="border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                    >
                      <PencilLine className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
          
          {!loading && heroSections.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center py-16 px-6 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900/50">
              <div className="text-slate-400 dark:text-slate-600 mb-4 rounded-full bg-slate-100 dark:bg-slate-800 p-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6"><path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3"></path></svg>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-center mb-3 font-medium">No hero sections found</p>
              <p className="text-slate-400 dark:text-slate-600 text-center text-sm mb-4">Create your first hero section to showcase on your homepage.</p>
              <Button onClick={handleCreate} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4" />
                Create Hero Section
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
} 