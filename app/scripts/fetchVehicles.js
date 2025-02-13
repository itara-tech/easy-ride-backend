import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fetchVehicles() {
    try {
        const vehicles = await prisma.vehicle.findMany();
        console.log(vehicles);
    } catch (error) {
        console.error("Error fetching vehicles:", error);
    } finally {
        await prisma.$disconnect();
    }
}

fetchVehicles();
