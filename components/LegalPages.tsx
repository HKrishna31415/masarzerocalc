import React from 'react';
import { motion } from 'framer-motion';
import Card from './Card';

export const TermsOfService: React.FC = () => {
  return (
    <div className="p-6 lg:p-8 w-full max-w-4xl mx-auto h-full overflow-y-auto custom-scrollbar">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">
          Terms of Service
        </h1>
        <p className="text-sm text-slate-500 dark:text-navy-400 mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <Card title="1. Acceptance of Terms">
          <p className="text-slate-600 dark:text-navy-300 leading-relaxed">
            By accessing and using the MasarZero Economics Calculator ("the Service"), you accept and agree to be bound by the terms and provision of this agreement.
          </p>
        </Card>

        <Card title="2. Use License" className="mt-6">
          <p className="text-slate-600 dark:text-navy-300 leading-relaxed mb-4">
            Permission is granted to temporarily use the Service for personal or commercial financial modeling purposes. This is the grant of a license, not a transfer of title, and under this license you may not:
          </p>
          <ul className="list-disc list-inside text-slate-600 dark:text-navy-300 space-y-2 ml-4">
            <li>Modify or copy the materials</li>
            <li>Use the materials for any commercial purpose without proper licensing</li>
            <li>Attempt to decompile or reverse engineer any software contained in the Service</li>
            <li>Remove any copyright or other proprietary notations from the materials</li>
          </ul>
        </Card>

        <Card title="3. Disclaimer" className="mt-6">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-500 rounded-lg p-4 mb-4">
            <p className="text-yellow-900 dark:text-yellow-200 font-bold mb-2">
              IMPORTANT: Financial Calculations Disclaimer
            </p>
            <p className="text-yellow-800 dark:text-yellow-300 text-sm leading-relaxed">
              The calculations, projections, and analyses provided by this Service are for informational and educational purposes only. They should not be considered as financial, investment, or professional advice.
            </p>
          </div>
          <p className="text-slate-600 dark:text-navy-300 leading-relaxed">
            The materials on the Service are provided on an 'as is' basis. MasarZero makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>
        </Card>

        <Card title="4. Limitations" className="mt-6">
          <p className="text-slate-600 dark:text-navy-300 leading-relaxed">
            In no event shall MasarZero or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the Service, even if MasarZero or a MasarZero authorized representative has been notified orally or in writing of the possibility of such damage.
          </p>
        </Card>

        <Card title="5. Accuracy of Materials" className="mt-6">
          <p className="text-slate-600 dark:text-navy-300 leading-relaxed">
            The materials appearing in the Service could include technical, typographical, or photographic errors. MasarZero does not warrant that any of the materials on its Service are accurate, complete or current. MasarZero may make changes to the materials contained in the Service at any time without notice.
          </p>
        </Card>

        <Card title="6. Links" className="mt-6">
          <p className="text-slate-600 dark:text-navy-300 leading-relaxed">
            MasarZero has not reviewed all of the sites linked to its Service and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by MasarZero of the site. Use of any such linked website is at the user's own risk.
          </p>
        </Card>

        <Card title="7. Modifications" className="mt-6">
          <p className="text-slate-600 dark:text-navy-300 leading-relaxed">
            MasarZero may revise these terms of service for its Service at any time without notice. By using this Service you are agreeing to be bound by the then current version of these terms of service.
          </p>
        </Card>

        <Card title="8. Governing Law" className="mt-6">
          <p className="text-slate-600 dark:text-navy-300 leading-relaxed">
            These terms and conditions are governed by and construed in accordance with applicable laws and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
          </p>
        </Card>
      </motion.div>
    </div>
  );
};

export const PrivacyPolicy: React.FC = () => {
  return (
    <div className="p-6 lg:p-8 w-full max-w-4xl mx-auto h-full overflow-y-auto custom-scrollbar">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-500 dark:text-navy-400 mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <Card title="1. Information We Collect">
          <p className="text-slate-600 dark:text-navy-300 leading-relaxed mb-4">
            The MasarZero Economics Calculator operates entirely in your browser. We collect minimal information:
          </p>
          <ul className="list-disc list-inside text-slate-600 dark:text-navy-300 space-y-2 ml-4">
            <li><strong>Local Storage:</strong> Your scenarios, preferences, and settings are stored locally in your browser</li>
            <li><strong>No Personal Data:</strong> We do not collect names, emails, or personal information</li>
            <li><strong>No Server Storage:</strong> Your financial data never leaves your device</li>
          </ul>
        </Card>

        <Card title="2. How We Use Information" className="mt-6">
          <p className="text-slate-600 dark:text-navy-300 leading-relaxed">
            Since all data is stored locally in your browser, we do not have access to your calculations, scenarios, or any data you input into the Service. Your data remains private and under your control.
          </p>
        </Card>

        <Card title="3. Data Security" className="mt-6">
          <p className="text-slate-600 dark:text-navy-300 leading-relaxed">
            Your data is stored in your browser's local storage. We recommend:
          </p>
          <ul className="list-disc list-inside text-slate-600 dark:text-navy-300 space-y-2 ml-4 mt-4">
            <li>Regularly exporting important scenarios</li>
            <li>Using secure devices and networks</li>
            <li>Clearing browser data will delete your saved scenarios</li>
          </ul>
        </Card>

        <Card title="4. Cookies" className="mt-6">
          <p className="text-slate-600 dark:text-navy-300 leading-relaxed">
            We use local storage (not cookies) to save your preferences and scenarios. This data is not transmitted to any server and remains on your device.
          </p>
        </Card>

        <Card title="5. Third-Party Services" className="mt-6">
          <p className="text-slate-600 dark:text-navy-300 leading-relaxed">
            This Service does not integrate with third-party services that collect data. All calculations are performed locally in your browser.
          </p>
        </Card>

        <Card title="6. Your Rights" className="mt-6">
          <p className="text-slate-600 dark:text-navy-300 leading-relaxed">
            You have complete control over your data:
          </p>
          <ul className="list-disc list-inside text-slate-600 dark:text-navy-300 space-y-2 ml-4 mt-4">
            <li>Export your data at any time</li>
            <li>Delete your data by clearing browser storage</li>
            <li>No account required - no data to delete from servers</li>
          </ul>
        </Card>

        <Card title="7. Changes to Privacy Policy" className="mt-6">
          <p className="text-slate-600 dark:text-navy-300 leading-relaxed">
            We may update this privacy policy from time to time. We will notify you of any changes by posting the new privacy policy on this page and updating the "Last updated" date.
          </p>
        </Card>

        <Card title="8. Contact" className="mt-6">
          <p className="text-slate-600 dark:text-navy-300 leading-relaxed">
            If you have questions about this privacy policy, please contact us through our website at www.masarzero.com
          </p>
        </Card>
      </motion.div>
    </div>
  );
};

export const Disclaimer: React.FC = () => {
  return (
    <div className="p-6 lg:p-8 w-full max-w-4xl mx-auto h-full overflow-y-auto custom-scrollbar">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">
          Financial Calculations Disclaimer
        </h1>
        <p className="text-sm text-slate-500 dark:text-navy-400 mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-2xl p-6 mb-8">
          <h2 className="text-2xl font-black text-red-900 dark:text-red-200 mb-4">
            ⚠️ Important Notice
          </h2>
          <p className="text-red-800 dark:text-red-300 leading-relaxed text-lg">
            The MasarZero Economics Calculator is a financial modeling tool designed for educational and informational purposes only. It is NOT a substitute for professional financial, investment, or business advice.
          </p>
        </div>

        <Card title="1. No Professional Advice">
          <p className="text-slate-600 dark:text-navy-300 leading-relaxed">
            The calculations, projections, analyses, and recommendations provided by this Service do not constitute financial, investment, tax, legal, or professional advice of any kind. You should not rely solely on this Service for making business or investment decisions.
          </p>
        </Card>

        <Card title="2. Accuracy and Reliability" className="mt-6">
          <p className="text-slate-600 dark:text-navy-300 leading-relaxed mb-4">
            While we strive for accuracy, we make no representations or warranties regarding:
          </p>
          <ul className="list-disc list-inside text-slate-600 dark:text-navy-300 space-y-2 ml-4">
            <li>The accuracy, completeness, or reliability of calculations</li>
            <li>The suitability of results for your specific situation</li>
            <li>The achievement of projected financial outcomes</li>
            <li>The absence of errors or bugs in the software</li>
          </ul>
        </Card>

        <Card title="3. Assumptions and Limitations" className="mt-6">
          <p className="text-slate-600 dark:text-navy-300 leading-relaxed mb-4">
            All financial models are based on assumptions that may not reflect reality:
          </p>
          <ul className="list-disc list-inside text-slate-600 dark:text-navy-300 space-y-2 ml-4">
            <li>Market conditions change and are unpredictable</li>
            <li>Historical performance does not guarantee future results</li>
            <li>Simplified models cannot capture all real-world complexities</li>
            <li>User inputs directly affect output accuracy</li>
          </ul>
        </Card>

        <Card title="4. Risk Acknowledgment" className="mt-6">
          <p className="text-slate-600 dark:text-navy-300 leading-relaxed">
            All business ventures and investments carry risk. The use of this Service does not reduce, eliminate, or transfer any business or financial risks. You acknowledge that:
          </p>
          <ul className="list-disc list-inside text-slate-600 dark:text-navy-300 space-y-2 ml-4 mt-4">
            <li>You may lose money on investments or business ventures</li>
            <li>Past performance is not indicative of future results</li>
            <li>You are solely responsible for your financial decisions</li>
            <li>You should consult qualified professionals before making decisions</li>
          </ul>
        </Card>

        <Card title="5. No Liability" className="mt-6">
          <p className="text-slate-600 dark:text-navy-300 leading-relaxed">
            MasarZero and its affiliates shall not be liable for any losses, damages, or adverse outcomes resulting from:
          </p>
          <ul className="list-disc list-inside text-slate-600 dark:text-navy-300 space-y-2 ml-4 mt-4">
            <li>Use or reliance on calculations from this Service</li>
            <li>Errors, inaccuracies, or omissions in the Service</li>
            <li>Business or investment decisions based on Service outputs</li>
            <li>Technical failures or data loss</li>
          </ul>
        </Card>

        <Card title="6. Professional Consultation Required" className="mt-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-500 rounded-lg p-4">
            <p className="text-blue-900 dark:text-blue-200 font-bold mb-2">
              Seek Professional Advice
            </p>
            <p className="text-blue-800 dark:text-blue-300 text-sm leading-relaxed">
              Before making any financial, investment, or business decisions, you should consult with qualified professionals including financial advisors, accountants, lawyers, and industry experts who can provide advice tailored to your specific circumstances.
            </p>
          </div>
        </Card>

        <Card title="7. User Responsibility" className="mt-6">
          <p className="text-slate-600 dark:text-navy-300 leading-relaxed">
            By using this Service, you acknowledge that:
          </p>
          <ul className="list-disc list-inside text-slate-600 dark:text-navy-300 space-y-2 ml-4 mt-4">
            <li>You are responsible for verifying all calculations</li>
            <li>You will conduct your own due diligence</li>
            <li>You understand the limitations of financial modeling</li>
            <li>You accept full responsibility for your decisions</li>
          </ul>
        </Card>

        <Card title="8. Educational Purpose" className="mt-6">
          <p className="text-slate-600 dark:text-navy-300 leading-relaxed">
            This Service is designed as an educational tool to help users understand financial concepts and explore different scenarios. It should be used as one of many resources in your decision-making process, not as the sole basis for decisions.
          </p>
        </Card>
      </motion.div>
    </div>
  );
};
