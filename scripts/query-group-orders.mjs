import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const orders = await prisma.groupOrder.findMany({
    where: {
      name: { contains: 'Test' }
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      shareCode: true,
      name: true,
      status: true,
      createdAt: true,
      hostName: true
    }
  })

  console.log('\nRecent Group Orders:')
  console.log('====================')
  orders.forEach(o => {
    console.log(`Name: ${o.name}`)
    console.log(`Share Code: ${o.shareCode}`)
    console.log(`Status: ${o.status}`)
    console.log(`Host: ${o.hostName || 'N/A'}`)
    console.log(`Created: ${o.createdAt}`)
    console.log('---')
  })

  await prisma.$disconnect()
}

main().catch(e => {
  console.error(e)
  prisma.$disconnect()
  process.exit(1)
})
