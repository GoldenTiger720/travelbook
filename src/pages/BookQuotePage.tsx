import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { QuoteForm } from "@/components/QuoteForm"
import { quoteService } from "@/services/quoteService"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft, FileText, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Quote } from "@/types/quote"

const BookQuotePage = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [submitting, setSubmitting] = useState(false)

  const handleQuoteSubmit = async (data: Omit<Quote, 'id' | 'quoteNumber' | 'metadata'>) => {
    setSubmitting(true)
    try {
      const newQuote = await quoteService.createQuote(data)
      toast({
        title: "Quote Created Successfully",
        description: `Quote ${newQuote.quoteNumber} has been created.`
      })
      // Redirect to the newly created quote
      navigate(`/quotes/${newQuote.id}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create quote. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    navigate("/my-quotes")
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/my-quotes")}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to My Quotes
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-8 h-8 text-primary" />
            Create New Quote
          </h1>
          <p className="text-muted-foreground">
            Prepare a professional travel quote for your customer
          </p>
        </div>
      </div>

      {/* Quick Tips */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Quick Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Ensure all customer contact information is accurate for follow-up</li>
            <li>• Add detailed tour descriptions to help clients understand what's included</li>
            <li>• Set realistic validity dates - typically 15-30 days</li>
            <li>• Use the price breakdown feature for transparency</li>
            <li>• Track lead sources to measure marketing effectiveness</li>
          </ul>
        </CardContent>
      </Card>

      {/* Quote Form */}
      <Card>
        <CardHeader>
          <CardTitle>Quote Details</CardTitle>
          <CardDescription>
            Fill in the information below to create a professional quote
          </CardDescription>
        </CardHeader>
        <CardContent>
          <QuoteForm 
            onSubmit={handleQuoteSubmit}
            onCancel={handleCancel}
            mode="create"
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default BookQuotePage