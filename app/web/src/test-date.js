import { format } from 'date-fns';

const now = new Date();
console.log("MMM yyyy:", format(now, "MMM yyyy"));
console.log("MMMM yyyy:", format(now, "MMMM yyyy"));
