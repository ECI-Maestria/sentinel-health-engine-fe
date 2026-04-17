import { RouterProvider } from 'react-router-dom'
import { Providers } from './providers'
import { router } from './router'
import { AlertNotificationPoller } from '@/presentation/organisms/AlertNotificationPoller/AlertNotificationPoller'

export function App() {
  return (
    <Providers>
      <AlertNotificationPoller />
      <RouterProvider router={router} />
    </Providers>
  )
}
