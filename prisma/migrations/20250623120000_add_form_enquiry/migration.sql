-- CreateTable
CREATE TABLE "FormEnquiry" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "emailSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormEnquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "FormEnquiry_kind_createdAt_idx" ON "FormEnquiry"("kind", "createdAt");
