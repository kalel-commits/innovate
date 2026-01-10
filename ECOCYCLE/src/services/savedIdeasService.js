// Firebase service for managing saved conversion ideas
import { getFirestore, collection, addDoc, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { auth } from '../firebase';

const db = getFirestore(auth.app);

/**
 * Save selected conversion ideas to Firebase
 * @param {string} userId - User ID
 * @param {Array} selectedIdeas - Array of selected conversion options
 * @param {Object} analysisData - Original analysis data (waste_analysis, quality_assessment, etc.)
 * @returns {Promise<string>} - Document ID of saved record
 */
export async function saveSelectedIdeas(userId, selectedIdeas, analysisData) {
    try {
        const docRef = await addDoc(collection(db, 'saved_ideas'), {
            userId,
            selectedIdeas,
            analysisData: {
                material_type: analysisData.waste_analysis?.detected_items?.[0]?.material_type || 'Unknown',
                specific_object: analysisData.waste_analysis?.detected_items?.[0]?.specific_object || '',
                detected_items: analysisData.waste_analysis?.detected_items || [],
                sustainability_score: analysisData.environmental_impact?.sustainability_score || 0,
                scrap_value: analysisData.quantity_estimation?.approximate_market_value || 0,
                weight_kg: analysisData.quantity_estimation?.approximate_weight_kg || 0,
                volume_liters: analysisData.quantity_estimation?.volume_estimate_liters || 0,
                cleanliness_level: analysisData.quality_assessment?.cleanliness_level || '',
                damage_level: analysisData.quality_assessment?.damage_level || '',
                reusability_score: analysisData.quality_assessment?.reusability_score || 0,
            },
            createdAt: Timestamp.now(),
            status: 'saved' // Can be: saved, in_progress, completed
        });
        
        console.log('✅ Ideas saved successfully with ID:', docRef.id);
        return docRef.id;
    } catch (error) {
        console.error('❌ Error saving ideas:', error);
        throw new Error('Failed to save ideas. Please try again.');
    }
}

/**
 * Get all saved ideas for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} - Array of saved idea records
 */
export async function getUserSavedIdeas(userId) {
    try {
        const q = query(
            collection(db, 'saved_ideas'),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const savedIdeas = [];
        
        querySnapshot.forEach((doc) => {
            savedIdeas.push({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt?.toDate() // Convert Firestore Timestamp to JS Date
            });
        });
        
        console.log(`✅ Retrieved ${savedIdeas.length} saved ideas for user`);
        return savedIdeas;
    } catch (error) {
        console.error('❌ Error fetching saved ideas:', error);
        throw new Error('Failed to load saved ideas.');
    }
}

/**
 * Get statistics for user's saved ideas
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - Statistics object
 */
export async function getUserIdeaStats(userId) {
    try {
        const ideas = await getUserSavedIdeas(userId);
        
        const totalIdeas = ideas.reduce((sum, record) => sum + record.selectedIdeas.length, 0);
        const totalScrapValue = ideas.reduce((sum, record) => sum + (record.analysisData.scrap_value || 0), 0);
        const totalConversionValue = ideas.reduce((sum, record) => {
            const maxValue = Math.max(...record.selectedIdeas.map(idea => idea.estimated_market_value_inr || 0));
            return sum + maxValue;
        }, 0);
        
        return {
            totalRecords: ideas.length,
            totalIdeas,
            totalScrapValue,
            totalConversionValue,
            potentialProfit: totalConversionValue - totalScrapValue
        };
    } catch (error) {
        console.error('❌ Error calculating stats:', error);
        return {
            totalRecords: 0,
            totalIdeas: 0,
            totalScrapValue: 0,
            totalConversionValue: 0,
            potentialProfit: 0
        };
    }
}
