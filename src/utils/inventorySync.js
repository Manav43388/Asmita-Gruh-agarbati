import { db } from '../firebase/config';
import { doc, runTransaction, collection, serverTimestamp } from 'firebase/firestore';

export const updateStock = async ({
  productId,
  productName,
  addQty = 0,
  reduceQty = 0,
  reason = 'manual',
  orderId = null,
  minStock = null
}) => {
  try {
    await runTransaction(db, async (transaction) => {
      const prodRef = doc(db, 'products', productId);
      const prodDoc = await transaction.get(prodRef);
      
      if (!prodDoc.exists()) {
        throw new Error('Product not found');
      }

      const currentStock = prodDoc.data().stock || 0;
      const parsedAdd = parseInt(addQty) || 0;
      const parsedReduce = parseInt(reduceQty) || 0;
      
      const newStock = currentStock + parsedAdd - parsedReduce;

      if (newStock < 0) {
        throw new Error(`Insufficient stock for ${productName || productId}. Available: ${currentStock}`);
      }
      
      // Reasonable limit to prevent absurd stock values, but allow reduction if already high
      if (newStock > 1000000 && newStock > currentStock) {
        throw new Error(`Stock value too large for ${productName || productId}.`);
      }

      const updateData = {
        stock: newStock,
        lastStockUpdate: serverTimestamp()
      };

      if (minStock !== null && !isNaN(minStock)) {
        updateData.minStock = parseInt(minStock);
      }

      // 1. Update Product
      transaction.update(prodRef, updateData);

      // 2. Add Log
      const diff = parsedAdd - parsedReduce;
      if (diff !== 0) {
        const logRef = doc(collection(db, 'inventory_logs'));
        const logData = {
          productId,
          productName: productName || prodDoc.data().name,
          type: diff > 0 ? 'IN' : 'OUT',
          quantity: Math.abs(diff),
          reason,
          timestamp: serverTimestamp()
        };
        
        if (orderId) {
          logData.orderId = orderId;
        }

        transaction.set(logRef, logData);
      }
    });

    return { success: true };
  } catch (error) {
    console.error('Update Stock Error:', error);
    return { success: false, error: error.message };
  }
};

export const handleInventoryFromOrder = async (order, actionType) => {
  if (!order || !order.items || order.items.length === 0) return { success: true };

  const orderId = order.id || order.orderId;

  try {
    const promises = order.items.map(item => {
      if (!item.id) return Promise.resolve();
      
      const isDeduct = actionType === 'DEDUCT';
      
      return updateStock({
        productId: item.id,
        productName: item.title || item.name,
        addQty: isDeduct ? 0 : item.quantity,
        reduceQty: isDeduct ? item.quantity : 0,
        reason: isDeduct ? 'Order Placed' : 'Order Cancelled',
        orderId: orderId
      });
    });

    const results = await Promise.all(promises);
    
    // Check if any failed
    const failed = results.filter(r => r && !r.success);
    if (failed.length > 0) {
      throw new Error(failed.map(f => f.error).join(', '));
    }

    return { success: true };
  } catch (error) {
    console.error('Order Inventory Sync Error:', error);
    return { success: false, error: error.message };
  }
};
