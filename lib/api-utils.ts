import { toast } from "@/components/ui/use-toast"

type FetchOptions = RequestInit & {
  showSuccessToast?: boolean
  successMessage?: string
  showErrorToast?: boolean
  errorMessage?: string
}

export async function fetchApi<T = any>(
  url: string,
  options: FetchOptions = {},
): Promise<{ data: T | null; error: any }> {
  const {
    showSuccessToast = false,
    successMessage = "Operation completed successfully",
    showErrorToast = true,
    errorMessage = "An error occurred",
    ...fetchOptions
  } = options

  try {
    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...fetchOptions.headers,
      },
      ...fetchOptions,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || "An unexpected error occurred")
    }

    if (showSuccessToast) {
      toast({
        title: "Success",
        description: successMessage,
      })
    }

    return { data, error: null }
  } catch (error: any) {
    if (showErrorToast) {
      toast({
        title: "Error",
        description: error.message || errorMessage,
        variant: "destructive",
      })
    }

    return { data: null, error }
  }
}

