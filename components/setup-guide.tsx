"use client"

import { useState } from "react"
import { ChevronRight, Code2, Database, FileCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { toast } from "@/components/ui/use-toast"
import { LoadingSpinner } from "@/components/ui/loading-spinner"

export function SetupGuide() {
  const [steps, setSteps] = useState({
    createSchema: false,
    seedData: false,
    testConnection: false,
  })

  const [loading, setLoading] = useState<string | null>(null)
  const [testResult, setTestResult] = useState<any>(null)

  const handleStepComplete = (step: keyof typeof steps) => {
    setSteps((prev) => ({ ...prev, [step]: true }))
  }

  const handleCreateSchema = async () => {
    setLoading("createSchema")
    try {
      const response = await fetch("/api/setup-db", {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Muvaffaqiyatli",
          description: "Ma'lumotlar bazasi sxemasi yaratildi",
        })
        handleStepComplete("createSchema")
      } else {
        toast({
          title: "Xatolik",
          description: data.error || "Ma'lumotlar bazasi sxemasini yaratishda xatolik yuz berdi",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Xatolik",
        description: "Kutilmagan xatolik yuz berdi",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const handleSeedData = async () => {
    setLoading("seedData")
    try {
      const response = await fetch("/api/seed", {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Muvaffaqiyatli",
          description: "Namunali ma'lumotlar kiritildi",
        })
        handleStepComplete("seedData")
      } else {
        toast({
          title: "Xatolik",
          description: data.error || "Namunali ma'lumotlarni kiritishda xatolik yuz berdi",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Xatolik",
        description: "Kutilmagan xatolik yuz berdi",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const handleTestConnection = async () => {
    setLoading("testConnection")
    setTestResult(null)
    try {
      const response = await fetch("/api/test-supabase")

      const data = await response.json()
      setTestResult(data)

      if (data.success) {
        toast({
          title: "Muvaffaqiyatli",
          description: "Supabase ulanishi to'g'ri ishlayapti",
        })
        handleStepComplete("testConnection")
      } else {
        toast({
          title: "Xatolik",
          description: data.error || "Supabase'ga ulanishda xatolik yuz berdi",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Xatolik",
        description: "Kutilmagan xatolik yuz berdi",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>O'rnatish qo'llanmasi</CardTitle>
        <CardDescription>
          Mehmonxona boshqaruv tizimini o'rnatish uchun quyidagi bosqichlarni bajaring
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button
                variant={steps.createSchema ? "default" : "outline"}
                className="w-full justify-between"
                onClick={() => !steps.createSchema && handleCreateSchema()}
                disabled={loading === "createSchema"}
              >
                <div className="flex items-center gap-2">
                  {loading === "createSchema" ? (
                    <LoadingSpinner className="h-4 w-4" />
                  ) : (
                    <Database className="h-4 w-4" />
                  )}
                  <span>Ma'lumotlar bazasi sxemasini yaratish</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Mehmonxona ma'lumotlarini saqlash uchun ma'lumotlar bazasi sxemasini yarating.
              </p>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button
                variant={steps.seedData ? "default" : "outline"}
                className="w-full justify-between"
                onClick={() => !steps.seedData && handleSeedData()}
                disabled={loading === "seedData" || !steps.createSchema}
              >
                <div className="flex items-center gap-2">
                  {loading === "seedData" ? (
                    <LoadingSpinner className="h-4 w-4" />
                  ) : (
                    <FileCheck className="h-4 w-4" />
                  )}
                  <span>Boshlang'ich ma'lumotlarni kiritish</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Tizimni sinab ko'rish uchun namunali ma'lumotlarni kiriting.
              </p>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible>
            <CollapsibleTrigger asChild>
              <Button
                variant={steps.testConnection ? "default" : "outline"}
                className="w-full justify-between"
                onClick={() => !steps.testConnection && handleTestConnection()}
                disabled={loading === "testConnection" || !steps.seedData}
              >
                <div className="flex items-center gap-2">
                  {loading === "testConnection" ? (
                    <LoadingSpinner className="h-4 w-4" />
                  ) : (
                    <Code2 className="h-4 w-4" />
                  )}
                  <span>Ulanishni tekshirish</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Ma'lumotlar bazasiga ulanishni tekshiring va tizim to'g'ri ishlayotganiga ishonch hosil qiling.
              </p>
              {testResult && (
                <div className="mt-2 p-2 rounded bg-muted text-sm">
                  <pre className="whitespace-pre-wrap">
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-muted-foreground">
          {Object.values(steps).every(Boolean)
            ? "Barcha bosqichlar muvaffaqiyatli yakunlandi"
            : "Barcha bosqichlarni ketma-ket bajaring"}
        </div>
        <Button
          variant="default"
          onClick={() => window.location.href = "/dashboard"}
          disabled={!Object.values(steps).every(Boolean)}
        >
          Boshqaruv paneliga o'tish
        </Button>
      </CardFooter>
    </Card>
  )
}

