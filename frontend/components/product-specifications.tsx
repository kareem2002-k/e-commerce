import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from "@/components/ui/card"

interface ProductSpecificationsProps {
  specifications: Record<string, string>
}

export function ProductSpecifications({ specifications }: ProductSpecificationsProps) {
  // Convert camelCase to Title Case
  const formatKey = (key: string) => {
    return key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Specification</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(specifications).map(([key, value]) => (
            <TableRow key={key}>
              <TableCell className="font-medium">{formatKey(key)}</TableCell>
              <TableCell>{value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}
