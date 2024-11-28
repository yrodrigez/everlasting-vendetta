import { NextResponse, NextRequest } from 'next/server';
import moment from "moment";

export function middleware(req: NextRequest) {
  const url = req.nextUrl;

  if (url.pathname === '/calendar') {
    if (!url.searchParams.has('d')) {
      // Set the default 'd' query parameter to the current date
      url.searchParams.set('d', moment().format('YYYY-MM-DD'));


      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}
