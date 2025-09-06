import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { 
  Download,
  ChevronDown,
  FileSpreadsheet,
  FileText
} from "lucide-react"

interface QuotesHeaderProps {
  onExport: (format: 'excel' | 'pdf') => void
}

export function QuotesHeader({ 
  onExport
}: QuotesHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">My Quotes</h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1">
          Create and manage travel quotes
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="sm:size-default">
              <Download className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Export</span>
              <ChevronDown className="w-4 h-4 ml-1 sm:ml-2" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48 p-2">
            <div className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => onExport('excel')}
              >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Export to Excel
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => onExport('pdf')}
              >
                <FileText className="w-4 h-4 mr-2" />
                Export to PDF
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}