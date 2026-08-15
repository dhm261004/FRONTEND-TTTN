import { Navigate, Route, Routes } from 'react-router-dom'
import { SecurityPage } from '@/modules/candidate/pages/SecurityPage'
import { ProfilePage } from '@/modules/candidate/pages/ProfilePage'
import { AppliedScholarshipsPage } from '@/modules/candidate/pages/AppliedScholarshipsPage'
import { SavedScholarshipsPage } from '@/modules/candidate/pages/SavedScholarshipsPage'
import { MentorPurchasesPage } from '@/modules/candidate/pages/MentorPurchasesPage'
import { MentorSessionsPage } from '@/modules/candidate/pages/MentorSessionsPage'
import { TransactionHistoryPage } from '@/modules/candidate/pages/TransactionHistoryPage'

export function CandidateAccountRoutes() {
  return (
    <Routes>
      <Route index element={<Navigate to="ho-so" replace />} />
      <Route path="ho-so" element={<ProfilePage />} />
      <Route path="bao-mat" element={<SecurityPage />} />
      <Route path="ung-tuyen" element={<AppliedScholarshipsPage />} />
      <Route path="da-luu" element={<SavedScholarshipsPage />} />
      <Route path="mentor/goi" element={<MentorPurchasesPage />} />
      <Route path="mentor/lich-hen" element={<MentorSessionsPage />} />
      <Route path="giao-dich" element={<TransactionHistoryPage />} />
    </Routes>
  )
}
