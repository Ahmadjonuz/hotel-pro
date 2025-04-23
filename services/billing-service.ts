import { supabase } from "@/lib/supabase"
import { handleSupabaseError } from "@/lib/utils"

export interface Invoice {
  id: string
  invoice_number: string
  amount: number
  status: 'paid' | 'unpaid' | 'cancelled'
  due_date: string
  created_at: string
  updated_at: string
  client_id: string
  client_name: string
  client_email: string
  description?: string
  items?: InvoiceItem[]
}

export interface InvoiceItem {
  id: string
  invoice_id: string
  description: string
  quantity: number
  unit_price: number
  total: number
  created_at: string
}

export interface PaymentMethod {
  id: string
  user_id: string
  card_type: string
  last_four: string
  expiry_month: number
  expiry_year: number
  is_default: boolean
  created_at: string
}

export interface BillingSettings {
  id: string
  user_id: string
  auto_payments: boolean
  billing_cycle: 'monthly' | 'quarterly' | 'annually'
  billing_address: {
    street: string
    city: string
    state: string
    postal_code: string
    country: string
  }
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  invoice_id: string
  amount: number
  payment_method_id: string
  status: 'pending' | 'completed' | 'failed'
  transaction_id?: string
  created_at: string
  updated_at: string
}

export interface BillingError {
  message: string
  details?: any
  code?: string
}

export interface BillingResponse<T> {
  data: T | null
  error: BillingError | null
}

export const billingService = {
  // Invoices
  async getAllInvoices(userId: string): Promise<BillingResponse<Invoice[]>> {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) {
        return {
          data: null,
          error: {
            message: error.message,
            details: error.details,
            code: error.code
          }
        }
      }

      return {
        data: data as Invoice[],
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Hisob fakturlarini yuklashda xatolik yuz berdi'
        }
      }
    }
  },

  async getInvoiceById(id: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, items:invoice_items(*)')
      .eq('id', id)
      .single()

    if (error) {
      return { data: null, error: handleSupabaseError(error) }
    }
    return { data, error: null }
  },

  async createInvoice(invoiceData: Omit<Invoice, 'id' | 'created_at' | 'updated_at'>): Promise<BillingResponse<Invoice>> {
    try {
      // Extract items from invoice data
      const { items, ...invoiceWithoutItems } = invoiceData

      // Get the current user's ID from Supabase auth
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return {
          data: null,
          error: {
            message: 'User not authenticated',
            details: userError?.message,
            code: 'AUTH_ERROR'
          }
        }
      }

      // First create the invoice with user_id
      const { data: invoices, error: invoiceError } = await supabase
        .from('invoices')
        .insert([{ ...invoiceWithoutItems, user_id: user.id }])
        .select()

      if (invoiceError) {
        return {
          data: null,
          error: {
            message: invoiceError.message,
            details: invoiceError.details,
            code: invoiceError.code
          }
        }
      }

      if (!invoices || invoices.length === 0) {
        return {
          data: null,
          error: {
            message: 'Failed to create invoice',
            code: 'INSERT_ERROR'
          }
        }
      }

      const invoice = invoices[0]

      // If there are items, create them separately
      if (items && items.length > 0) {
        const invoiceItems = items.map(item => ({
          ...item,
          invoice_id: invoice.id
        }))

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(invoiceItems)

        if (itemsError) {
          // If items creation fails, delete the invoice and return error
          await supabase
            .from('invoices')
            .delete()
            .eq('id', invoice.id)

          return {
            data: null,
            error: {
              message: itemsError.message,
              details: itemsError.details,
              code: itemsError.code
            }
          }
        }
      }

      // Fetch the complete invoice with items
      const { data: completeInvoices, error: fetchError } = await supabase
        .from('invoices')
        .select('*, items:invoice_items(*)')
        .eq('id', invoice.id)

      if (fetchError) {
        return {
          data: null,
          error: {
            message: fetchError.message,
            details: fetchError.details,
            code: fetchError.code
          }
        }
      }

      if (!completeInvoices || completeInvoices.length === 0) {
        return {
          data: null,
          error: {
            message: 'Failed to fetch created invoice',
            code: 'FETCH_ERROR'
          }
        }
      }

      return {
        data: completeInvoices[0] as Invoice,
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'Hisob-fakturani yaratishda xatolik yuz berdi'
        }
      }
    }
  },

  async updateInvoice(id: string, updates: Partial<Invoice>) {
    const { data, error } = await supabase
      .from('invoices')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return { data: null, error: handleSupabaseError(error) }
    }
    return { data, error: null }
  },

  async deleteInvoice(id: string) {
    const { error } = await supabase
      .from('invoices')
      .delete()
      .eq('id', id)

    if (error) return { error: handleSupabaseError(error) }
    return { error: null }
  },

  // Invoice Items
  async addInvoiceItem(item: Omit<InvoiceItem, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('invoice_items')
      .insert([item])
      .select()
      .single()

    if (error) {
      return { data: null, error: handleSupabaseError(error) }
    }
    return { data, error: null }
  },

  async deleteInvoiceItem(id: string) {
    const { error } = await supabase
      .from('invoice_items')
      .delete()
      .eq('id', id)

    if (error) return { error: handleSupabaseError(error) }
    return { error: null }
  },

  // Payment Methods
  async getPaymentMethods(userId: string): Promise<BillingResponse<PaymentMethod[]>> {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', userId)
        .order('is_default', { ascending: false })

      if (error) {
        return {
          data: null,
          error: {
            message: error.message,
            details: error.details,
            code: error.code
          }
        }
      }

      return {
        data: data as PaymentMethod[],
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'To\'lov usullarini yuklashda xatolik yuz berdi'
        }
      }
    }
  },

  async addPaymentMethod(paymentMethodData: Omit<PaymentMethod, 'id' | 'created_at' | 'updated_at'>): Promise<BillingResponse<PaymentMethod>> {
    try {
      const { data, error } = await supabase
        .from('payment_methods')
        .insert([paymentMethodData])
        .select()
        .single()

      if (error) {
        return {
          data: null,
          error: {
            message: error.message,
            details: error.details,
            code: error.code
          }
        }
      }

      return {
        data: data as PaymentMethod,
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'To\'lov usulini qo\'shishda xatolik yuz berdi'
        }
      }
    }
  },

  async deletePaymentMethod(id: string) {
    const { error } = await supabase
      .from('payment_methods')
      .delete()
      .eq('id', id)

    if (error) return { error: handleSupabaseError(error) }
    return { error: null }
  },

  async setDefaultPaymentMethod(id: string, userId: string) {
    const { error: updateError } = await supabase
      .from('payment_methods')
      .update({ is_default: false })
      .eq('user_id', userId)

    if (updateError) {
      return { data: null, error: handleSupabaseError(updateError) }
    }

    const { data, error } = await supabase
      .from('payment_methods')
      .update({ is_default: true })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return { data: null, error: handleSupabaseError(error) }
    }
    return { data, error: null }
  },

  // Billing Settings
  async getBillingSettings(userId: string): Promise<BillingResponse<BillingSettings>> {
    try {
      // Try to get existing settings
      const { data: settings, error } = await supabase
        .from('billing_settings')
        .select('*')
        .eq('user_id', userId)

      if (error) {
        return {
          data: null,
          error: {
            message: error.message,
            details: error.details,
            code: error.code
          }
        }
      }

      // If no settings exist, create default settings
      if (!settings || settings.length === 0) {
        const defaultSettings = {
          user_id: userId,
          auto_payments: false,
          billing_cycle: 'monthly',
          billing_address: {
            street: '',
            city: '',
            state: '',
            postal_code: '',
            country: ''
          }
        }

        const { data: newSettings, error: createError } = await supabase
          .from('billing_settings')
          .insert([defaultSettings])
          .select()

        if (createError) {
          return {
            data: null,
            error: {
              message: createError.message,
              details: createError.details,
              code: createError.code
            }
          }
        }

        return {
          data: newSettings?.[0] as BillingSettings,
          error: null
        }
      }

      return {
        data: settings[0] as BillingSettings,
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'To\'lov sozlamalarini yuklashda xatolik yuz berdi'
        }
      }
    }
  },

  async updateBillingSettings(userId: string, settings: Partial<BillingSettings>): Promise<BillingResponse<BillingSettings>> {
    try {
      const { data, error } = await supabase
        .from('billing_settings')
        .update(settings)
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        return {
          data: null,
          error: {
            message: error.message,
            details: error.details,
            code: error.code
          }
        }
      }

      return {
        data: data as BillingSettings,
        error: null
      }
    } catch (error) {
      return {
        data: null,
        error: {
          message: error instanceof Error ? error.message : 'To\'lov sozlamalarini yangilashda xatolik yuz berdi'
        }
      }
    }
  },

  // Payments
  async createPayment(payment: Omit<Payment, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('payments')
      .insert([payment])
      .select()
      .single()

    if (error) {
      return { data: null, error: handleSupabaseError(error) }
    }
    return { data, error: null }
  },

  async getPaymentsByInvoiceId(invoiceId: string) {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('invoice_id', invoiceId)
      .order('created_at', { ascending: false })

    if (error) {
      return { data: null, error: handleSupabaseError(error) }
    }
    return { data, error: null }
  },

  // Reports
  async getBillingReports(startDate: string, endDate: string) {
    const { data, error } = await supabase
      .from('invoices')
      .select('*, items:invoice_items(*), payments(*)')
      .gte('created_at', startDate)
      .lte('created_at', endDate)
      .order('created_at', { ascending: false })

    if (error) {
      return { data: null, error: handleSupabaseError(error) }
    }
    return { data, error: null }
  }
} 