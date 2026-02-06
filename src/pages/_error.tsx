import type { NextPageContext } from 'next'
import type { ReactElement } from 'react'
import Link from 'next/link'

interface ErrorProps {
  statusCode?: number
}

function Error({ statusCode }: ErrorProps): ReactElement {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-4xl font-heading font-bold text-gray-900 mb-4">
          {statusCode ? `Error ${statusCode}` : 'An error occurred'}
        </h1>
        <p className="text-gray-600 mb-8">
          {statusCode === 404
            ? 'The page you are looking for could not be found.'
            : 'Something went wrong. Please try again later.'}
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-brand-blue text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  )
}

Error.getInitialProps = ({ res, err }: NextPageContext) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error
