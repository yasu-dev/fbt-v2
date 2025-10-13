import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/database';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const productId = params.id;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Get product from database
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: {
        id: true,
        name: true,
        sku: true,
        category: true,
        price: true,
        condition: true,
        status: true,
        sellerId: true,
        listingId: true,
        metadata: true,
        seller: {
          select: {
            fullName: true,
            email: true,
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if product has eBay listing (simulated for demo)
    const hasEbayListing = product.status === 'listing' || product.status === 'sold';
    
    if (!hasEbayListing) {
      return NextResponse.json({
        hasEbayListing: false,
        productInfo: {
          id: product.id,
          name: product.name,
          sku: product.sku,
          category: product.category,
          price: product.price,
          condition: product.condition,
          status: product.status,
          seller: product.seller?.fullName || 'Unknown',
        },
        message: 'この商品はまだeBayに出品されていません'
      });
    }

    // 実際のlistingIdがある場合のみeBay情報を返す
    const ebayItemId = product.listingId;
    if (!ebayItemId) {
      return NextResponse.json({
        hasEbayListing: false,
        productInfo: {
          id: product.id,
          name: product.name,
          sku: product.sku,
          category: product.category,
          price: product.price,
          condition: product.condition,
          status: product.status,
          seller: product.seller?.fullName || 'Unknown',
        },
        message: 'この商品はまだeBayに出品されていません'
      });
    }

    const listingUrl = `https://www.ebay.com/itm/${ebayItemId}`;

    return NextResponse.json({
      hasEbayListing: true,
      ebayItemId: ebayItemId,
      listingUrl: listingUrl,
      status: product.status === 'sold' ? 'sold' : 'active',
      ebayTitle: product.name,
      ebayCategory: product.category,
      ebayCondition: product.condition,
      productInfo: {
        id: product.id,
        name: product.name,
        sku: product.sku,
        category: product.category,
        price: product.price,
        condition: product.condition,
        status: product.status,
        seller: product.seller?.fullName || 'Unknown',
      }
    });

  } catch (error) {
    console.error('Error fetching eBay listing info:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

