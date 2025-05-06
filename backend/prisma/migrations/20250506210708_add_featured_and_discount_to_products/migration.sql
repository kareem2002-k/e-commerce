-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "discount" DOUBLE PRECISION,
ADD COLUMN     "featured" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Product_featured_idx" ON "Product"("featured");
